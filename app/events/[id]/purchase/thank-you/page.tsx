// app/events/[id]/purchase/thank-you/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { fetchPublicEvent } from '@/lib/api'

export default function ThankYouPage() {
  const params = useParams()
  const eventId = params.id as string
  const [event, setEvent] = useState<any>(null)

  useEffect(() => {
    const getEventDetails = async () => {
      try {
        const data = await fetchPublicEvent(eventId)
        if (data) {
          setEvent(data)
        }
      } catch (err) {
        console.error("Failed to load event details")
      }
    }
    getEventDetails()
  }, [eventId])

  return (
    <div className="min-h-screen custom-gradient-bg flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full border-2 border-black">
        <h1 className="text-4xl md:text-5xl font-slimbold text-black mb-8 uppercase">
          Thank You !!!
        </h1>

        {event && (
          <div className="mb-8 p-6 bg-gray-50 border-2 border-black rounded-lg inline-block w-full max-w-md">
            <h2 className="text-2xl font-slimbold text-black mb-3">{event.title}</h2>
            <p className="text-black text-lg mb-1">
              {event.display_date} {event.event_time ? `• ${event.event_time}` : ''}
            </p>
            <p className="text-black text-lg">{event.venue_name}</p>
          </div>
        )}
        
        <div className="mx-auto mb-10 text-xl font-medium text-black space-y-4">
          <p>Thank you for your Ticket purchase!</p>
          <p>Your ticket purchase has been processed, and you will soon receive a confirmation Email.</p>
          <p className="font-slimbold text-2xl mt-8">See you at Elephant!</p>
        </div>

        <div className="mt-4">
          <Link 
            href="/"
            className="bg-[var(--color-primary)] hover:bg-[#45B8E5] text-black font-slimbold text-lg py-3 px-8 rounded-lg border-2 border-black shadow-lg hover:shadow-xl transition-all inline-block"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}