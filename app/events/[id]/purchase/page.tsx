// app/events/[id]/purchase/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { fetchPublicEvent } from '@/lib/api'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

interface FormData {
  quantity: number
  buyer_name: string
  phone: string
  email: string
  reference_number: string
  attendees: { name: string }[]
  payslip: File | null
}

interface FormErrors {
  quantity?: string
  buyer_name?: string
  phone?: string
  email?: string
  reference_number?: string
  attendees?: string[]
  payslip?: string
  general?: string
}

export default function TicketPurchasePage() {
  const router = useRouter()
  const params = useParams()
  const eventId = params.id as string

  const [event, setEvent] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState(1) // 1: House Rules, 2: Form, 3: Confirmation
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [acceptedRules, setAcceptedRules] = useState(false)
  const [payslipPreview, setPayslipPreview] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState<FormData>({
    quantity: 1,
    buyer_name: '',
    phone: '',
    email: '',
    reference_number: '',
    attendees: [{ name: '' }],
    payslip: null
  })

  const [formErrors, setFormErrors] = useState<FormErrors>({})

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setIsLoading(true)
        const eventData = await fetchPublicEvent(eventId)
        if (!eventData) {
          setError('Event not found')
          return
        }
        setEvent(eventData)

        // Check if event is active
        if (!eventData.is_active) {
          setError(eventData.inactive_message || 'Ticket sales are not currently available for this event')
          return
        }

        // Load saved form data from localStorage if available
        const savedFormData = localStorage.getItem(`ticketForm_${eventId}`)
        if (savedFormData) {
          const parsedData = JSON.parse(savedFormData)
          // Check if data is not older than 2 hours
          if (Date.now() - parsedData.timestamp < 2 * 60 * 60 * 1000) {
            setFormData(parsedData.data)
            setStep(2) // Skip house rules if they already accepted
            setAcceptedRules(true)
          } else {
            localStorage.removeItem(`ticketForm_${eventId}`)
          }
        }
      } catch (err) {
        console.error('Failed to fetch event:', err)
        setError('Failed to load event details')
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvent()
  }, [eventId])

  const saveFormData = (data: FormData) => {
    const formDataWithTimestamp = {
      data,
      timestamp: Date.now()
    }
    localStorage.setItem(`ticketForm_${eventId}`, JSON.stringify(formDataWithTimestamp))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const newFormData = {
      ...formData,
      [name]: name === 'quantity' ? parseInt(value) : value
    }
    
    setFormData(newFormData)
    saveFormData(newFormData)
  }

  const handleAttendeeChange = (index: number, value: string) => {
    const newAttendees = [...formData.attendees]
    newAttendees[index].name = value
    
    const newFormData = {
      ...formData,
      attendees: newAttendees
    }
    
    setFormData(newFormData)
    saveFormData(newFormData)
  }

  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newQuantity = parseInt(e.target.value)
    const currentAttendees = formData.attendees
    
    // Adjust attendees array based on new quantity
    let newAttendees = [...currentAttendees]
    if (newQuantity > currentAttendees.length) {
      // Add empty attendees
      for (let i = currentAttendees.length; i < newQuantity; i++) {
        newAttendees.push({ name: '' })
      }
    } else if (newQuantity < currentAttendees.length) {
      // Remove extra attendees
      newAttendees = newAttendees.slice(0, newQuantity)
    }
    
    const newFormData = {
      ...formData,
      quantity: newQuantity,
      attendees: newAttendees
    }
    
    setFormData(newFormData)
    saveFormData(newFormData)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        setFormErrors({
          ...formErrors,
          payslip: 'Please upload a valid image (JPEG, PNG, or WebP)'
        })
        return
      }
      
      // Validate file size (max 1.5MB)
      if (file.size > 1572864) {
        setFormErrors({
          ...formErrors,
          payslip: 'File size too large. Max 1.5MB allowed'
        })
        return
      }
      
      const newFormData = {
        ...formData,
        payslip: file
      }
      
      setFormData(newFormData)
      saveFormData(newFormData)
      setFormErrors({ ...formErrors, payslip: undefined })
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPayslipPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const calculateTotalPrice = () => {
    if (!event) return 0
    
    const { quantity } = formData
    const { ticket_price_regular, ticket_price_bundle, bundle_size } = event
    
    if (bundle_size && quantity >= bundle_size && ticket_price_bundle) {
      // Calculate bundle pricing
      const fullBundles = Math.floor(quantity / bundle_size)
      const remainingTickets = quantity % bundle_size
      
      return (fullBundles * ticket_price_bundle) + (remainingTickets * ticket_price_regular)
    } else {
      // Regular pricing
      return quantity * ticket_price_regular
    }
  }

  const validateForm = () => {
    const errors: FormErrors = {}
    
    // Basic validation
    if (!formData.buyer_name.trim()) errors.buyer_name = 'Name is required'
    if (!formData.phone.trim()) errors.phone = 'Phone number is required'
    if (!formData.email.trim()) errors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid email format'
    if (!formData.reference_number.trim()) errors.reference_number = 'Reference number is required'
    if (!formData.payslip) errors.payslip = 'Payslip is required'
    
    // Validate attendees
    const attendeeErrors: string[] = []
    formData.attendees.forEach((attendee, index) => {
      if (!attendee.name.trim()) {
        attendeeErrors[index] = 'Attendee name is required'
      }
    })
    
    if (attendeeErrors.length > 0) errors.attendees = attendeeErrors
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    setFormErrors({})
    
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('quantity', formData.quantity.toString())
      formDataToSend.append('buyer_name', formData.buyer_name)
      formDataToSend.append('phone', formData.phone)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('reference_number', formData.reference_number)
      
      // Add attendees in multipart format: attendees[0][name], attendees[1][name], etc.
      formData.attendees.forEach((attendee, index) => {
        formDataToSend.append(`attendees[${index}][name]`, attendee.name)
      })
      
      if (formData.payslip) {
        formDataToSend.append('payslip', formData.payslip)
      }
      
      const response = await fetch(`${API_BASE_URL}/public/events/${eventId}/purchase`, {
        method: 'POST',
        body: formDataToSend,
      })
      
      if (!response.ok) {
        let errorMessage = `Server returned ${response.status}`
        
        try {
          const errorData = await response.json()
          errorMessage = errorData.error?.message || errorData.message || errorMessage
        } catch {
          try {
            const text = await response.text()
            errorMessage = text || errorMessage
          } catch {
            // If both fail, use the generic status message
          }
        }
        
        // Parse backend errors
        const parsedErrors: FormErrors = {}
        
        if (errorMessage.includes('Email already used') || errorMessage.includes('Duplicate email')) {
          parsedErrors.email = 'This email has already been used for this event'
        } else if (errorMessage.includes('Reference number already used') || errorMessage.includes('Duplicate reference')) {
          parsedErrors.reference_number = 'This reference number has already been used for this event'
        } else if (errorMessage.includes('Event is not active')) {
          parsedErrors.general = 'This event is no longer active'
        } else if (errorMessage.includes('tickets left') || errorMessage.includes('sold out')) {
          parsedErrors.general = errorMessage
        } else if (errorMessage.includes('attendees') || errorMessage.includes('Attendees')) {
          if (errorMessage.includes('count must match')) {
            parsedErrors.attendees = ['Number of attendees must match ticket quantity']
          } else {
            parsedErrors.attendees = ['Please check attendee information']
          }
        } else if (errorMessage.includes('Payslip') || errorMessage.includes('payslip')) {
          parsedErrors.payslip = 'Please upload a valid payslip'
        } else if (errorMessage.includes('Validation failed')) {
          // Extract validation errors from backend
          if (errorMessage.includes('email')) {
            parsedErrors.email = 'Please enter a valid email address'
          }
          if (errorMessage.includes('phone')) {
            parsedErrors.phone = 'Please enter a valid phone number'
          }
          if (errorMessage.includes('buyer_name')) {
            parsedErrors.buyer_name = 'Please enter a valid name'
          }
          if (errorMessage.includes('reference_number')) {
            parsedErrors.reference_number = 'Please enter a valid reference number'
          }
        } else {
          parsedErrors.general = errorMessage || 'An unexpected error occurred'
        }
        
        setFormErrors(parsedErrors)
        return // <- Beendet den Vorgang sanft, Next.js stürzt nicht ab, Inline-Fehler werden angezeigt
      }
      
      // Success - clear saved form data and redirect to thank you page
      localStorage.removeItem(`ticketForm_${eventId}`)
      router.push(`/events/${eventId}/purchase/thank-you`)
      
    } catch (err: any) {
      console.error('Ticket purchase failed:', err)
      if (!formErrors.general) {
        setFormErrors({
          ...formErrors,
          general: 'Failed to process ticket purchase. Please try again.'
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen custom-gradient-bg flex items-center justify-center">
        <div className="text-black font-slim">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen custom-gradient-bg flex flex-col items-center justify-center p-8">
        <div className="text-red-500 font-slim text-center mb-4">{error}</div>
        <Link 
          href={`/events/${eventId}`}
          className="bg-[var(--color-primary)] hover:bg-[#45B8E5] text-black font-medium py-2 px-4 rounded transition-colors"
        >
          Back to Event
        </Link>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen custom-gradient-bg flex items-center justify-center">
        <div className="text-black font-slim">Event not found</div>
      </div>
    )
  }

  // House Rules Modal (Step 1)
  if (step === 1) {
    return (
      <div className="min-h-screen custom-gradient-bg p-8 flex flex-col items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full">
          <h2 className="text-2xl font-slimbold text-center mb-6 text-black">ELEPHANT HAUS RULES</h2>
          
          <div className="prose prose-p:text-black prose-headings:text-black prose-li:text-black prose-strong:text-black max-w-none mb-6 text-black">
            <p className="mb-4">
              Before you Buy a Ticket, please read our House Rules carefully
            </p>
            
            <h3 className="font-slimbold text-lg mb-2">No to:</h3>
            <ul className="list-disc list-inside mb-4">
              <li>LGBTQIA+ Phobia</li>
              <li>Misogyny</li>
              <li>Bullying</li>
              <li>Grooming</li>
              <li>Predators</li>
              <li>Oppressors</li>
              <li>Social Hierarchy</li>
              <li>Gatekeeping</li>
              <li>Racism</li>
              <li>Sexism</li>
              <li>Ageism</li>
            </ul>
            
            <h3 className="font-slimbold text-lg mb-2">Yes to:</h3>
            <ul className="list-disc list-inside mb-4">
              <li>Dance</li>
              <li>Talk</li>
              <li>Respect</li>
              <li>Consent</li>
            </ul>
            
            <p>
              Accepting them means to hold them near to your heart and follow them without exception as you attend one of our events.
            </p>
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={() => {
                setAcceptedRules(true)
                setStep(2)
              }}
              className="bg-[var(--color-primary)] hover:bg-[#45B8E5] text-black font-slimbold text-xl px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-black"
            >
              I ACCEPT
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Purchase Form (Step 2)
  return (
    <div className="min-h-screen custom-gradient-bg pb-8 md:pb-12">
      <div className="h-12 md:h-16"></div>
      
      {/* Back button */}
      <div className="container mx-auto px-4 mb-6">
        <button
          onClick={() => {
            if (step === 2) {
              setStep(1)
            } else {
              setStep(step - 1)
            }
          }}
          className="flex items-center text-black hover:text-[var(--color-primary)] transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </div>

      {/* Event Header */}
      <div className="text-center px-6 mb-8 md:mb-12">
        <div className="font-slimbold text-2xl md:text-3xl text-black mb-4">
          {event.title}
        </div>
        <div className="underline mx-auto w-full max-w-md">
          <hr className="border-black border-t-2" />
        </div>
      </div>

      {/* Event Poster */}
      <div className="flex justify-center mb-8 md:mb-12 px-4">
        <Image
          src={event.poster_image_url}
          alt={`Poster for ${event.title}`}
          width={300}
          height={450}
          className="w-full max-w-[60vw] md:max-w-[30vw] border-[1vw] md:border-[1.5vw] border-black"
          unoptimized={true}
        />
      </div>

      {/* Purchase Form */}
      <div className="max-w-2xl mx-auto px-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {formErrors.general && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {formErrors.general}
            </div>
          )}

          {/* Quantity Selection */}
          <div>
            <label htmlFor="quantity" className="block text-lg font-medium text-black mb-2">
              Number of Tickets
            </label>
            <select
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleQuantityChange}
              className="w-full px-4 py-2 border-2 border-gray-400 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-black"
            >
              {[...Array(10)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>

          {/* Pricing Information */}
          <div className="bg-[var(--color-primary)]/20 p-4 rounded-lg text-black">
            <div className="text-center">
              <p className="text-lg font-medium">Total Amount Due:</p>
              <p className="text-2xl font-bold">₱{calculateTotalPrice()}</p>
              {event.bundle_size && formData.quantity >= event.bundle_size && (
                <p className="text-sm mt-2">
                  Bundle discount applied ({Math.floor(formData.quantity / event.bundle_size)} × {event.bundle_size} tickets)
                </p>
              )}
            </div>
          </div>

          {/* Payment Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <h3 className="font-medium text-black mb-2">Payment Instructions:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-black">
              <li>Send <strong>₱{calculateTotalPrice()}</strong> via GCash to <strong>09564696479 - Lance M****** N.</strong></li>
              <li>Take a screenshot of your payment confirmation</li>
              <li>Enter your reference number and upload the screenshot below</li>
            </ol>
          </div>

          {/* Buyer Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-black border-b pb-2">Your Information</h3>
            
            <div>
              <label htmlFor="buyer_name" className="block text-sm font-medium text-gray-700 mb-1">
                Your Name *
              </label>
              <input
                type="text"
                id="buyer_name"
                name="buyer_name"
                value={formData.buyer_name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-black ${
                  formErrors.buyer_name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {formErrors.buyer_name && (
                <p className="text-red-500 text-sm mt-1">{formErrors.buyer_name}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-black ${
                  formErrors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {formErrors.email && (
                <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-black ${
                  formErrors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {formErrors.phone && (
                <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
              )}
            </div>
          </div>

          {/* Attendee Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-black border-b pb-2">
              Attendee Information {formData.quantity > 1 && `(${formData.quantity} attendees)`}
            </h3>
            
            {formData.attendees.map((attendee, index) => (
              <div key={index}>
                <label htmlFor={`attendee-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                  {index === 0 ? 'Your Name (as attendee) *' : `Attendee ${index + 1} Name *`}
                </label>
                <input
                  type="text"
                  id={`attendee-${index}`}
                  value={attendee.name}
                  onChange={(e) => handleAttendeeChange(index, e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-black ${
                    formErrors.attendees && formErrors.attendees[index] ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.attendees && formErrors.attendees[index] && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.attendees[index]}</p>
                )}
              </div>
            ))}
          </div>

          {/* Payment Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-black border-b pb-2">Payment Details</h3>
            
            <div>
              <label htmlFor="reference_number" className="block text-sm font-medium text-gray-700 mb-1">
                GCash Reference Number *
              </label>
              <input
                type="text"
                id="reference_number"
                name="reference_number"
                value={formData.reference_number}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-black ${
                  formErrors.reference_number ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g. 6A2B4C8D"
              />
              {formErrors.reference_number && (
                <p className="text-red-500 text-sm mt-1">{formErrors.reference_number}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="payslip" className="block text-sm font-medium text-gray-700 mb-1">
                Upload Payment Screenshot *
              </label>
              <input
                type="file"
                id="payslip"
                name="payslip"
                onChange={handleFileChange}
                accept="image/*"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-black file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-primary)] file:text-black hover:file:bg-[#45B8E5] ${
                  formErrors.payslip ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {formErrors.payslip && (
                <p className="text-red-500 text-sm mt-1">{formErrors.payslip}</p>
              )}
              
              {payslipPreview && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Preview:</p>
                  <img
                    src={payslipPreview}
                    alt="Payslip preview"
                    className="max-w-xs max-h-40 object-contain border rounded"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[var(--color-primary)] hover:bg-[#45B8E5] text-black font-slimbold text-xl px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'PROCESSING...' : 'COMPLETE PURCHASE'}
            </button>
          </div>
        </form>

        {/* Loading Overlay während des Formular-Submits */}
      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-lg shadow-2xl flex flex-col items-center max-w-sm w-[90%] text-center">
            {/* Simple CSS Spinner */}
            <div className="w-16 h-16 border-4 border-gray-200 border-t-[var(--color-primary)] rounded-full animate-spin mb-6"></div>
            <h3 className="text-xl font-slimbold text-black mb-2">Processing Purchase</h3>
            <p className="text-gray-600">Please wait while we upload your payslip and secure your tickets...</p>
          </div>
        </div>
      )}

      </div>
    </div>
  )
}