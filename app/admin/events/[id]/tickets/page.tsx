// app/admin/events/[id]/tickets/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import authFetch from '@/lib/api-admin';

interface Attendee {
    name: string;
    checked_in: boolean;
}

interface Ticket {
    id: number;
    event_id: number;
    buyer_name: string;
    phone: string;
    email: string;
    payslip_url: string;
    reference_number: string;
    total_price: number;
    created_at: string;
    attendees: Attendee[];
}

interface Event {
    id: number;
    title: string;
    display_date: string;
    venue_name: string;
    venue_address: string;
    event_time: string;
    description: string;
    ticket_price_regular: number;
    ticket_price_bundle: number;
    bundle_size: number;
    max_tickets: number;
    sold_tickets: number;
    ticket_deadline: string;
    is_active: boolean;
    inactive_message: string | null;
    start_date: string;
    walk_in_price: number;
    walk_in_cash_count: number;
    walk_in_gcash_count: number;
    poster_image_url: string;
}

interface FormErrors {
    buyer_name?: string;
    phone?: string;
    email?: string;
    reference_number?: string;
    total_price?: string;
    attendees?: string[];
    payslip?: string;
    general?: string;
}

export default function TicketDashboardPage() {
    const router = useRouter();
    const params = useParams();
    const eventId = params.id as string;

    const [event, setEvent] = useState<Event | null>(null);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
        key: 'created_at',
        direction: 'desc'
    });
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingTicketId, setEditingTicketId] = useState<number | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
    const [payslipPreview, setPayslipPreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        buyer_name: '',
        phone: '',
        email: '',
        reference_number: '',
        total_price: 0,
        attendees: [{ name: '' }]
    });
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [payslipFile, setPayslipFile] = useState<File | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);

                // Fetch event data
                const eventResponse = await authFetch(`/api/v1/admin/events/${eventId}`);
                if (!eventResponse.ok) {
                    if (eventResponse.status === 401) {
                        router.push('/admin/login');
                        return;
                    }
                    throw new Error('Failed to fetch event');
                }
                const eventData: Event = await eventResponse.json();
                setEvent(eventData);

                // Fetch all tickets
                const ticketsResponse = await authFetch('/api/v1/admin/tickets');
                if (!ticketsResponse.ok) {
                    if (ticketsResponse.status === 401) {
                        router.push('/admin/login');
                        return;
                    }
                    throw new Error('Failed to fetch tickets');
                }
                const allTickets: Ticket[] = await ticketsResponse.json();

                // Filter tickets for this event only
                const eventTickets = allTickets.filter(ticket => ticket.event_id === parseInt(eventId));
                setTickets(eventTickets);
                setFilteredTickets(eventTickets);

            } catch (err: any) {
                console.error('Data fetch failed:', err);
                if (err.message.includes('401') || err.message.includes('Authentication failed')) {
                    setError('Authentication required. Redirecting to login...');
                    setTimeout(() => router.push('/admin/login'), 1500);
                } else {
                    setError('Failed to load data. Please try again later.');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [eventId, router]);

    // Filter tickets based on search term
    useEffect(() => {
        if (!searchTerm) {
            setFilteredTickets(tickets);
            return;
        }

        const lowercasedTerm = searchTerm.toLowerCase();
        const filtered = tickets.filter(ticket =>
            ticket.buyer_name.toLowerCase().includes(lowercasedTerm) ||
            ticket.email.toLowerCase().includes(lowercasedTerm) ||
            ticket.reference_number.toLowerCase().includes(lowercasedTerm) ||
            ticket.attendees.some(attendee =>
                attendee.name.toLowerCase().includes(lowercasedTerm)
            )
        );

        setFilteredTickets(filtered);
    }, [searchTerm, tickets]);

    // Sort tickets
    const sortedTickets = useMemo(() => {
        if (!sortConfig.key) return filteredTickets;

        return [...filteredTickets].sort((a, b) => {
            let aValue: any, bValue: any;

            switch (sortConfig.key) {
                case 'buyer_name':
                    aValue = a.buyer_name;
                    bValue = b.buyer_name;
                    break;
                case 'attendees':
                    aValue = a.attendees.map(a => a.name).join(', ');
                    bValue = b.attendees.map(a => a.name).join(', ');
                    break;
                case 'total_price':
                    aValue = a.total_price;
                    bValue = b.total_price;
                    break;
                case 'reference_number':
                    aValue = a.reference_number;
                    bValue = b.reference_number;
                    break;
                case 'contact':
                    aValue = `${a.email} ${a.phone}`;
                    bValue = `${b.email} ${b.phone}`;
                    break;
                case 'created_at':
                default:
                    aValue = new Date(a.created_at).getTime();
                    bValue = new Date(b.created_at).getTime();
                    break;
            }

            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }, [filteredTickets, sortConfig]);

    const parseBackendError = (errorMessage: string): FormErrors => {
        const errors: FormErrors = {};

        // Duplicate email error
        if (errorMessage.includes('Email already used') || errorMessage.includes('Duplicate email')) {
            errors.email = 'This email has already been used for this event';
        }

        // Duplicate reference number error
        if (errorMessage.includes('Reference number already used') || errorMessage.includes('Duplicate reference')) {
            errors.reference_number = 'This reference number has already been used for this event';
        }

        // Event not found
        if (errorMessage.includes('Event not found') || errorMessage.includes('not found')) {
            errors.general = 'This event is no longer available';
        }

        // Event inactive
        if (errorMessage.includes('Event is not active') || errorMessage.includes('not active')) {
            errors.general = 'This event is no longer active';
        }

        // Sold out
        if (errorMessage.includes('tickets left') || errorMessage.includes('sold out')) {
            errors.general = errorMessage;
        }

        // Attendee validation errors
        if (errorMessage.includes('attendees') || errorMessage.includes('Attendees')) {
            if (errorMessage.includes('count must match')) {
                errors.attendees = ['Number of attendees must match ticket quantity'];
            } else if (errorMessage.includes('Invalid attendees format')) {
                errors.attendees = ['Invalid attendee format'];
            } else if (errorMessage.includes('At least one attendee is required')) {
                errors.attendees = ['At least one attendee is required'];
            } else {
                errors.attendees = ['Please check attendee information'];
            }
        }

        // Payslip errors
        if (errorMessage.includes('Payslip') || errorMessage.includes('payslip')) {
            if (errorMessage.includes('upload is required')) {
                errors.payslip = 'Payslip upload is required';
            } else {
                errors.payslip = 'Please upload a valid payslip image (JPEG, PNG, WebP)';
            }
        }

        // File upload errors
        if (errorMessage.includes('File type') || errorMessage.includes('file type') || errorMessage.includes('Failed to upload')) {
            errors.payslip = errorMessage;
        }

        // Validation errors (from Joi)
        if (errorMessage.includes('Validation failed')) {
            if (errorMessage.includes('email')) {
                errors.email = 'Please enter a valid email address';
            }
            if (errorMessage.includes('phone')) {
                errors.phone = 'Please enter a valid phone number';
            }
            if (errorMessage.includes('buyer_name')) {
                errors.buyer_name = 'Please enter a valid name';
            }
            if (errorMessage.includes('reference_number')) {
                errors.reference_number = 'Please enter a valid reference number';
            }
            if (errorMessage.includes('total_price')) {
                errors.total_price = 'Please enter a valid price';
            }
        }

        // Generic error fallback
        if (Object.keys(errors).length === 0) {
            errors.general = errorMessage || 'An unexpected error occurred';
        }

        return errors;
    };

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
        const newFormData = {
            ...prev,
            [name]: value
        };
        
        // If buyer_name changes, update the first attendee's name
        if (name === 'buyer_name') {
            if (newFormData.attendees.length > 0) {
                newFormData.attendees[0].name = value;
            }
        }
        
        return newFormData;
    });
};

const handleAttendeeChange = (index: number, value: string) => {
    const newAttendees = [...formData.attendees];
    newAttendees[index].name = value;
    
    setFormData(prev => {
        const newFormData = {
            ...prev,
            attendees: newAttendees
        };
        
        // If first attendee changes, update the buyer_name
        if (index === 0) {
            newFormData.buyer_name = value;
        }
        
        return newFormData;
    });
};

const addAttendee = () => {
    setFormData(prev => ({
        ...prev,
        attendees: [...prev.attendees, { name: '' }]
    }));
};

    const removeAttendee = (index: number) => {
        if (formData.attendees.length <= 1) return;

        const newAttendees = [...formData.attendees];
        newAttendees.splice(index, 1);
        setFormData(prev => ({
            ...prev,
            attendees: newAttendees
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPayslipFile(file);
        }
    };

   const resetForm = () => {
    setFormData({
        buyer_name: '',
        phone: '',
        email: '',
        reference_number: '',
        total_price: 0,
        attendees: [{ name: '' }] // Start with one empty attendee
    });
    setPayslipFile(null);
    setEditingTicketId(null);
    setShowCreateForm(false);
    setFormErrors({}); // Clear errors on reset
};

   const handleEdit = (ticket: Ticket) => {
    setFormData({
        buyer_name: ticket.buyer_name,
        phone: ticket.phone,
        email: ticket.email,
        reference_number: ticket.reference_number,
        total_price: ticket.total_price,
        attendees: ticket.attendees.map(a => ({ name: a.name }))
    });
    setEditingTicketId(ticket.id);
    setShowCreateForm(true);
};

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setFormErrors({});

        try {
            if (editingTicketId) {
                // Update existing ticket - use admin endpoint
                const formDataToSend = new FormData();

                // Add form fields
                formDataToSend.append('buyer_name', formData.buyer_name);
                formDataToSend.append('phone', formData.phone);
                formDataToSend.append('email', formData.email);
                formDataToSend.append('reference_number', formData.reference_number);
                formDataToSend.append('total_price', formData.total_price.toString());

                // Add attendees in multipart format: attendees[0][name], attendees[1][name], etc.
                formData.attendees.forEach((attendee, index) => {
                    formDataToSend.append(`attendees[${index}][name]`, attendee.name);
                });

                // Add payslip file if provided
                if (payslipFile) {
                    formDataToSend.append('payslip', payslipFile);
                }

                const response = await authFetch(`/api/v1/admin/tickets/${editingTicketId}`, {
                    method: 'PATCH',
                    body: formDataToSend,
                });


                if (!response.ok) {
                    const responseClone = response.clone(); // Clone the response to read it multiple times
                    let errorMessage = `Server returned ${response.status}`;

                    try {
                        const errorData = await responseClone.json();
                        // Extract the actual error message from the backend's structured format
                        errorMessage = errorData.error?.message || errorData.message || errorMessage;
                    } catch {
                        try {
                            const text = await responseClone.text();
                            errorMessage = text || errorMessage;
                        } catch {
                            // If both fail, use the generic status message
                        }
                    }

                    throw new Error(errorMessage);
                }


                // Refresh data
                const ticketsResponse = await authFetch('/api/v1/admin/tickets');
                if (!ticketsResponse.ok) throw new Error('Failed to fetch updated tickets');
                const allTickets: Ticket[] = await ticketsResponse.json();
                const eventTickets = allTickets.filter(ticket => ticket.event_id === parseInt(eventId));
                setTickets(eventTickets);

                resetForm();

            } else {
                // Create new ticket using the ADMIN endpoint (not public)
                if (!payslipFile) {
                    setFormErrors({ payslip: 'Payslip is required for new tickets' });
                    setIsSubmitting(false);
                    return;
                }

                const formDataToSend = new FormData();
                formDataToSend.append('event_id', eventId);
                formDataToSend.append('buyer_name', formData.buyer_name);
                formDataToSend.append('phone', formData.phone);
                formDataToSend.append('email', formData.email);
                formDataToSend.append('reference_number', formData.reference_number);
                formDataToSend.append('total_price', formData.total_price.toString());

                // Add attendees in multipart format: attendees[0][name], attendees[1][name], etc.
                formData.attendees.forEach((attendee, index) => {
                    formDataToSend.append(`attendees[${index}][name]`, attendee.name);
                });

                formDataToSend.append('payslip', payslipFile);

                const response = await authFetch('/api/v1/admin/tickets', {
                    method: 'POST',
                    body: formDataToSend,
                });

                if (!response.ok) {
                    const responseClone = response.clone(); // Clone the response to read it multiple times
                    let errorMessage = `Server returned ${response.status}`;

                    try {
                        const errorData = await responseClone.json();
                        // Extract the actual error message from the backend's structured format
                        errorMessage = errorData.error?.message || errorData.message || errorMessage;
                    } catch {
                        try {
                            const text = await responseClone.text();
                            errorMessage = text || errorMessage;
                        } catch {
                            // If both fail, use the generic status message
                        }
                    }

                    throw new Error(errorMessage);
                }

                // Refresh data
                const ticketsResponse = await authFetch('/api/v1/admin/tickets');
                if (!ticketsResponse.ok) throw new Error('Failed to fetch updated tickets');
                const allTickets: Ticket[] = await ticketsResponse.json();
                const eventTickets = allTickets.filter(ticket => ticket.event_id === parseInt(eventId));
                setTickets(eventTickets);

                resetForm();
            }


        } catch (err: any) {
            console.error('Form submission failed:', err);
            const errorMessage = err.message || 'Failed to save ticket. Please try again.';
            const parsedErrors = parseBackendError(errorMessage);
            setFormErrors(parsedErrors);

            // Scroll to first error
            setTimeout(() => {
                const firstErrorElement = document.querySelector('[data-error="true"]');
                if (firstErrorElement) {
                    firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (ticketId: number) => {
        try {
            const response = await authFetch(`/api/v1/admin/tickets/${ticketId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Remove the ticket from state
            setTickets(prev => prev.filter(t => t.id !== ticketId));
            setShowDeleteConfirm(null);

        } catch (err: any) {
            console.error('Ticket deletion failed:', err);
            setError('Failed to delete ticket. Please try again.');
            setShowDeleteConfirm(null);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center custom-gradient-bg">
                <div className="text-black font-slim">Loading tickets...</div>
            </div>
        );
    }

    if (error && !error.includes('Redirecting')) {
        return (
            <div className="min-h-screen flex items-center justify-center custom-gradient-bg">
                <div className="text-red-500 font-slim">{error}</div>
                <Link href={`/admin/events/${eventId}`} className="ml-4 text-[var(--color-primary)] hover:underline">
                    Back to Event
                </Link>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen flex items-center justify-center custom-gradient-bg">
                <div className="text-black font-slim">Event not found</div>
                <Link href="/admin" className="ml-4 text-[var(--color-primary)] hover:underline">
                    Back to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="p-8 custom-gradient-bg min-h-screen">
            {/* Header Navigation */}
            <div className="flex items-center mb-6">
                <Link
                    href={`/admin/events/${eventId}`}
                    className="bg-[var(--color-primary)] hover:bg-[#45B8E5] text-black font-medium py-2 px-4 rounded-lg shadow-md transition-colors border border-black mr-4"
                >
                    &larr; Back to Event
                </Link>
                <h1 className="text-3xl font-slimbold text-black">Ticket Management</h1>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {/* Event Card */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-6">
                    {event.poster_image_url && (
                        <div className="flex-shrink-0 w-full md:w-1/4">
                            <img
                                src={event.poster_image_url}
                                alt={event.title}
                                className="w-full h-auto max-w-xs object-contain rounded-lg border"
                            />
                        </div>
                    )}

                    <div className="flex-1">
                        <h2 className="text-2xl font-slimbold text-[var(--color-primary)] mb-4">{event.title}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <p className="text-black"><strong>Date:</strong> {event.display_date}</p>
                                <p className="text-black"><strong>Venue:</strong> {event.venue_name}</p>
                                <p className="text-black"><strong>Address:</strong> {event.venue_address}</p>
                                <p className="text-black"><strong>Time:</strong> {event.event_time}</p>
                                <p className="text-black"><strong>Start Date:</strong> {new Date(event.start_date).toLocaleDateString()}</p>
                                <p className="text-black"><strong>Ticket Deadline:</strong> {new Date(event.ticket_deadline).toLocaleDateString()}</p>
                            </div>

                            <div className="space-y-2">
                                <p className="text-black"><strong>Regular Price:</strong> ₱{event.ticket_price_regular}</p>
                                {event.ticket_price_bundle && (
                                    <p className="text-black">
                                        <strong>Bundle Price:</strong> ₱{event.ticket_price_bundle} (Size: {event.bundle_size})
                                    </p>
                                )}
                                <p className="text-black"><strong>Walk-in Price:</strong> ₱{event.walk_in_price}</p>
                                <p className="text-black"><strong>Sold Tickets:</strong> {event.sold_tickets} / {event.max_tickets}</p>
                                <p className="text-black"><strong>Walk-in Cash:</strong> {event.walk_in_cash_count}</p>
                                <p className="text-black"><strong>Walk-in GCash:</strong> {event.walk_in_gcash_count}</p>
                                <p className="text-black">
                                    <strong>Status:</strong>
                                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${event.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {event.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </p>
                            </div>
                        </div>
                        {event.inactive_message && (
                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                <p className="text-yellow-800 text-sm">{event.inactive_message}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Search and Controls */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                            Search Tickets
                        </label>
                        <input
                            type="text"
                            id="search"
                            placeholder="Search by name, email, reference number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-black"
                        />
                    </div>

                    <button
                        onClick={() => {
                            resetForm();
                            setShowCreateForm(!showCreateForm);
                        }}
                        className="bg-[var(--color-primary)] hover:bg-[#45B8E5] text-black font-medium py-2 px-4 rounded transition-colors border border-black"
                    >
                        {showCreateForm ? 'Cancel' : 'Add New Ticket'}
                    </button>
                </div>

                {/* Create/Edit Form */}
                {(showCreateForm || editingTicketId !== null) && (
                    <div className="mt-6 p-4 border border-gray-200 rounded-md">
                        <h3 className="text-lg font-slimbold text-[var(--color-primary)] mb-4">
                            {editingTicketId ? 'Edit Ticket' : 'Create New Ticket'}
                        </h3>
                        {formErrors.general && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                {formErrors.general}
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Buyer Name *</label>
                                    <input
                                        type="text"
                                        name="buyer_name"
                                        value={formData.buyer_name}
                                        onChange={handleInputChange}
                                        required
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-black ${formErrors.buyer_name ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        data-error={!!formErrors.buyer_name}
                                    />
                                    {formErrors.buyer_name && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.buyer_name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-black ${formErrors.email ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        data-error={!!formErrors.email}
                                    />
                                    {formErrors.email && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-black"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number *</label>
                                    <input
                                        type="text"
                                        name="reference_number"
                                        value={formData.reference_number}
                                        onChange={handleInputChange}
                                        required
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-black ${formErrors.reference_number ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        data-error={!!formErrors.reference_number}
                                    />
                                    {formErrors.reference_number && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.reference_number}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Price (₱) *</label>
                                    <input
                                        type="number"
                                        name="total_price"
                                        value={formData.total_price}
                                        onChange={handleInputChange}
                                        min="0"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-black"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Payslip {!editingTicketId && '*'}
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        required={!editingTicketId}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-black file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-primary)] file:text-black hover:file:bg-[#45B8E5] ${formErrors.payslip ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        data-error={!!formErrors.payslip}
                                    />
                                    {formErrors.payslip && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.payslip}</p>
                                    )}
                                    {editingTicketId && (
                                        <p className="text-xs text-gray-500 mt-1">Leave empty to keep current payslip</p>
                                    )}
                                </div>
                            </div>

                            {/* Attendees */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-700">Attendees *</label>
                                    <button
                                        type="button"
                                        onClick={addAttendee}
                                        className="text-sm text-[var(--color-primary)] hover:underline"
                                    >
                                        + Add Attendee
                                    </button>
                                </div>

                                {formErrors.attendees && (
                                    <p className="text-red-500 text-sm mb-2">{formErrors.attendees[0]}</p>
                                )}

                                {formData.attendees.map((attendee, index) => (
    <div key={index} className="flex items-center gap-2 mb-2">
        <input
            type="text"
            value={attendee.name}
            onChange={(e) => handleAttendeeChange(index, e.target.value)}
            placeholder="Attendee name"
            required
            readOnly={index === 0} // Make first attendee read-only
            className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-black ${
                formErrors.attendees ? 'border-red-500' : 'border-gray-300'
            } ${index === 0 ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            data-error={!!formErrors.attendees}
        />
        {formData.attendees.length > 1 && index !== 0 && ( // Don't show remove for first attendee
            <button
                type="button"
                onClick={() => removeAttendee(index)}
                className="text-red-500 hover:text-red-700 text-lg font-bold"
                title="Remove attendee"
            >
                ×
            </button>
        )}
    </div>
))}
                            </div>

                            <div className="flex justify-end space-x-4 pt-4">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="bg-gray-300 hover:bg-gray-400 text-black font-medium py-2 px-4 rounded transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-[var(--color-primary)] hover:bg-[#45B8E5] text-black font-medium py-2 px-6 rounded shadow-md transition-colors border border-black disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Saving...' : 'Save Ticket'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>

            {/* Tickets Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort('buyer_name')}
                                >
                                    Name {sortConfig.key === 'buyer_name' && (
                                        sortConfig.direction === 'asc' ? '↑' : '↓'
                                    )}
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort('attendees')}
                                >
                                    Attendees {sortConfig.key === 'attendees' && (
                                        sortConfig.direction === 'asc' ? '↑' : '↓'
                                    )}
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort('total_price')}
                                >
                                    Price {sortConfig.key === 'total_price' && (
                                        sortConfig.direction === 'asc' ? '↑' : '↓'
                                    )}
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Payslip
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort('reference_number')}
                                >
                                    Reference # {sortConfig.key === 'reference_number' && (
                                        sortConfig.direction === 'asc' ? '↑' : '↓'
                                    )}
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort('contact')}
                                >
                                    Contact {sortConfig.key === 'contact' && (
                                        sortConfig.direction === 'asc' ? '↑' : '↓'
                                    )}
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {sortedTickets.length > 0 ? (
                                sortedTickets.map((ticket) => (
                                    <tr key={ticket.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {ticket.buyer_name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {ticket.attendees.map(a => a.name).join(', ')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            ₱{ticket.total_price}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {ticket.payslip_url && (
                                                <button
                                                    onClick={() => setPayslipPreview(ticket.payslip_url)}
                                                    className="text-[var(--color-primary)] hover:text-[#45B8E5]"
                                                >
                                                    <img
                                                        src={ticket.payslip_url}
                                                        alt="Payslip preview"
                                                        className="h-10 w-10 object-cover rounded border"
                                                    />
                                                </button>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {ticket.reference_number}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <div>{ticket.email}</div>
                                            <div>{ticket.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleEdit(ticket)}
                                                className="text-[var(--color-primary)] hover:text-[#45B8E5] mr-3"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => setShowDeleteConfirm(ticket.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                                        {searchTerm ? 'No tickets match your search' : 'No tickets found for this event'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Payslip Preview Modal */}
            {payslipPreview && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
                    onClick={() => setPayslipPreview(null)}
                >
                    <div className="bg-white p-4 rounded-lg max-w-4xl max-h-screen overflow-auto">
                        <img
                            src={payslipPreview}
                            alt="Payslip"
                            className="max-w-full max-h-screen"
                        />
                        <button
                            onClick={() => setPayslipPreview(null)}
                            className="mt-4 bg-[var(--color-primary)] hover:bg-[#45B8E5] text-black font-medium py-2 px-4 rounded transition-colors border border-black"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
                        <h3 className="text-lg font-slimbold text-red-600 mb-4">Confirm Deletion</h3>
                        <p className="text-gray-700 mb-6">
                            Are you sure you want to delete this ticket? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setShowDeleteConfirm(null)}
                                className="bg-gray-300 hover:bg-gray-400 text-black font-medium py-2 px-4 rounded transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(showDeleteConfirm)}
                                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition-colors"
                            >
                                Delete Ticket
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}