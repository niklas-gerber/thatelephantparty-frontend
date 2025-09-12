// app/admin/events/[id]/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import authFetch from '@/lib/api-admin';

interface Event {
  id: number;
  title: string;
  display_date: string;
  venue_name: string;
  venue_address: string;
  event_time: string;
  description: string;
  email_template_content: string;
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

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditSection, setShowEditSection] = useState(false);

  // Refs for auto-scrolling
  const editSectionRef = useRef<HTMLDivElement>(null);
  const posterPreviewRef = useRef<HTMLDivElement>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<Event>>({});
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);

  // Auto-scroll to edit section when it opens
  useEffect(() => {
    if (showEditSection && editSectionRef.current) {
      setTimeout(() => {
        editSectionRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  }, [showEditSection]);

  // Auto-scroll to poster preview when a new file is selected
  useEffect(() => {
    if (posterPreview && posterPreviewRef.current) {
      setTimeout(() => {
        posterPreviewRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 100);
    }
  }, [posterPreview]);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setIsLoading(true);
        const response = await authFetch(`/api/v1/admin/events/${eventId}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const eventData: Event = await response.json();
        setEvent(eventData);

        // Initialize form data but exclude read-only fields
        const { id, sold_tickets, walk_in_cash_count, walk_in_gcash_count, ...editableData } = eventData;
        setFormData(editableData);

      } catch (err: any) {
        console.error('Event fetch failed:', err);

        if (err.message.includes('401') || err.message.includes('Authentication failed')) {
          setError('Authentication required. Redirecting to login...');
          router.push('/admin/login');
        } else if (err.message.includes('404')) {
          setError('Event not found');
        } else {
          setError('Failed to load event data. Please try again later.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventData();
  }, [eventId, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPosterFile(file);
      const previewUrl = URL.createObjectURL(file);
      setPosterPreview(previewUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const formDataToSend = new FormData();

      // Add only editable fields (exclude read-only fields)
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          // Convert empty strings to null for numeric fields that can be null
          if ((key === 'bundle_size' || key === 'ticket_price_bundle') && value === '') {
            formDataToSend.append(key, 'null');
          } else {
            formDataToSend.append(key, value.toString());
          }
        }
      });

      // Add poster file if selected
      if (posterFile) {
        formDataToSend.append('poster', posterFile);
      }

      const response = await authFetch(`/api/v1/admin/events/${eventId}`, {
        method: 'PATCH',
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Server returned ${response.status}: ${errorData}`);
      }

      const updatedEvent = await response.json();
      setEvent(updatedEvent);

      // Update form data but exclude read-only fields
      const { id, sold_tickets, walk_in_cash_count, walk_in_gcash_count, ...editableData } = updatedEvent;
      setFormData(editableData);

      setSuccess('Event updated successfully!');
      setPosterFile(null);
      setPosterPreview(null);

    } catch (err: any) {
      console.error('Event update failed:', err);
      setError(err.message || 'Failed to update event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await authFetch(`/api/v1/admin/events/${eventId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      router.push('/admin');
      router.refresh();

    } catch (err: any) {
      console.error('Event deletion failed:', err);
      setError('Failed to delete event. Please try again.');
      setShowDeleteConfirm(false);
    }
  };

  const toggleActiveStatus = async () => {
    try {
      const response = await authFetch(`/api/v1/admin/events/${eventId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_active: !event?.is_active
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedEvent = await response.json();
      setEvent(updatedEvent);

      // Update form data but exclude read-only fields
      const { id, sold_tickets, walk_in_cash_count, walk_in_gcash_count, ...editableData } = updatedEvent;
      setFormData(editableData);

      setSuccess(`Event ${updatedEvent.is_active ? 'activated' : 'deactivated'} successfully!`);

    } catch (err: any) {
      console.error('Status toggle failed:', err);
      setError('Failed to update event status. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center custom-gradient-bg">
        <div className="text-black font-slim">Loading event...</div>
      </div>
    );
  }

  if (error && !error.includes('Redirecting')) {
    return (
      <div className="min-h-screen flex items-center justify-center custom-gradient-bg">
        <div className="text-red-500 font-slim">{error}</div>
        <Link href="/admin" className="ml-4 text-[var(--color-primary)] hover:underline">
          Back to Dashboard
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
          href="/admin"
          className="bg-[var(--color-primary)] hover:bg-[#45B8E5] text-black font-medium py-2 px-4 rounded-lg shadow-md transition-colors border border-black mr-4"
        >
          &larr; Back to Dashboard
        </Link>
        <h1 className="text-3xl font-slimbold text-black">Event Details</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* Section 1: Event Display */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          {/* Poster Image - Larger size */}
          {event.poster_image_url && (
            <div className="flex-shrink-0 w-full md:w-1/4">
              <img
                src={event.poster_image_url}
                alt={event.title}
                className="w-full h-auto max-w-xs object-contain rounded-lg border"
              />
            </div>
          )}

          {/* Event Details */}
          <div className="flex-1">
            <h2 className="text-2xl font-slimbold text-[var(--color-primary)] mb-4">{event.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-black"><strong>Display Date:</strong> {event.display_date}</p>
                <p className="text-black"><strong>Venue:</strong> {event.venue_name}</p>
                <p className="text-black"><strong>Address:</strong> {event.venue_address}</p>
                <p className="text-black"><strong>Time:</strong> {event.event_time}</p>
                <p className="text-black"><strong>Start Date:</strong> {new Date(event.start_date).toLocaleDateString()}</p>
              </div>

              <div className="space-y-2">
                <p className="text-black"><strong>Regular Price:</strong> ₱{event.ticket_price_regular}</p>
                <p className="text-black"><strong>Bundle Price:</strong> {event.ticket_price_bundle ? `₱${event.ticket_price_bundle} (Size: ${event.bundle_size})` : 'Not set'}</p>
                <p className="text-black"><strong>Walk-in Price:</strong> ₱{event.walk_in_price}</p>
                <p className="text-black"><strong>Max Tickets:</strong> {event.max_tickets}</p>
                <p className="text-black"><strong>Sold Tickets:</strong> {event.sold_tickets}</p>
                <p className="text-black"><strong>Ticket Deadline:</strong> {new Date(event.ticket_deadline).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Status and Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${event.is_active
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
              }`}>
              {event.is_active ? 'Active' : 'Inactive'}
            </span>

            <button
              onClick={toggleActiveStatus}
              className="bg-[var(--color-primary)] hover:bg-[#45B8E5] text-black font-medium py-1 px-3 rounded transition-colors border border-black text-sm"
            >
              {event.is_active ? 'Deactivate' : 'Activate'}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* New action buttons */}
            <Link
              href={`/admin/events/${eventId}/tickets`}
              className="bg-[var(--color-primary)] hover:bg-[#45B8E5] text-black font-medium py-1 px-3 rounded transition-colors border border-black text-sm"
            >
              Ticket Dashboard
            </Link>

            <Link
              href={`/admin/events/${eventId}/door`}
              className="bg-[var(--color-primary)] hover:bg-[#45B8E5] text-black font-medium py-1 px-3 rounded transition-colors border border-black text-sm"
            >
              Door Management
            </Link>

            <Link
              href={`/admin/events/${eventId}/downloads`}
              className="bg-[var(--color-primary)] hover:bg-[#45B8E5] text-black font-medium py-1 px-3 rounded transition-colors border border-black text-sm"
            >
              Download Reports
            </Link>

            <button
              onClick={() => setShowEditSection(!showEditSection)}
              className="bg-[var(--color-primary)] hover:bg-[#45B8E5] text-black font-medium py-1 px-3 rounded transition-colors border border-black text-sm"
            >
              {showEditSection ? 'Hide Edit' : 'Edit Event'}
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-1 px-3 rounded transition-colors text-sm"
            >
              Delete Event
            </button>
          </div>
        </div>
      </div>

      {/* Section 2: Edit Form (Collapsible) */}
      {showEditSection && (
        <div ref={editSectionRef} className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-slimbold text-[var(--color-primary)] mb-6">Edit Event</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-slimbold text-[var(--color-primary)]">Basic Information</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title || ''}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Date *</label>
                  <input
                    type="text"
                    name="display_date"
                    value={formData.display_date || ''}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Venue Name *</label>
                  <input
                    type="text"
                    name="venue_name"
                    value={formData.venue_name || ''}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Venue Address *</label>
                  <input
                    type="text"
                    name="venue_address"
                    value={formData.venue_address || ''}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Time *</label>
                  <input
                    type="text"
                    name="event_time"
                    value={formData.event_time || ''}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date ? formData.start_date.toString().split('T')[0] : ''}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-black"
                  />
                </div>
              </div>

              {/* Ticket Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-slimbold text-[var(--color-primary)]">Ticket Information</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Regular Price (₱) *</label>
                  <input
                    type="number"
                    name="ticket_price_regular"
                    value={formData.ticket_price_regular || ''}
                    onChange={handleInputChange}
                    min="0"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bundle Price (₱)</label>
                  <input
                    type="number"
                    name="ticket_price_bundle"
                    value={formData.ticket_price_bundle || ''}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-black"
                    placeholder="Leave empty for no bundle"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bundle Size</label>
                  <input
                    type="number"
                    name="bundle_size"
                    value={formData.bundle_size || ''}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-black"
                    placeholder="Leave empty for no bundle"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Tickets *</label>
                  <input
                    type="number"
                    name="max_tickets"
                    value={formData.max_tickets || ''}
                    onChange={handleInputChange}
                    min="1"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Walk-in Price (₱) *</label>
                  <input
                    type="number"
                    name="walk_in_price"
                    value={formData.walk_in_price || ''}
                    onChange={handleInputChange}
                    min="0"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ticket Deadline *</label>
                  <input
                    type="datetime-local"
                    name="ticket_deadline"
                    value={formData.ticket_deadline ? new Date(formData.ticket_deadline).toISOString().slice(0, 16) : ''}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-black"
                  />
                </div>
              </div>
            </div>

            {/* Description and Email Template */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Template *</label>
                <textarea
                  name="email_template_content"
                  value={formData.email_template_content || ''}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Inactive Message</label>
                <textarea
                  name="inactive_message"
                  value={formData.inactive_message || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-black"
                />
              </div>
            </div>

            {/* Poster Upload */}
            <div className="space-y-4">
              <h3 className="text-lg font-slimbold text-[var(--color-primary)]">Poster Image</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload New Poster</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                />
              </div>

              {(posterPreview || event.poster_image_url) && (
                <div ref={posterPreviewRef} className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Poster Preview:</p>
                  <img
                    src={posterPreview || event.poster_image_url}
                    alt="Poster preview"
                    className="w-48 h-48 object-contain border rounded-md"
                  />
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowEditSection(false)}
                className="bg-gray-300 hover:bg-gray-400 text-black font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[var(--color-primary)] hover:bg-[#45B8E5] text-black font-medium py-2 px-6 rounded-lg shadow-md transition-colors border border-black disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-slimbold text-red-600 mb-4">Confirm Deletion</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this event? <strong>All event data, tickets, and attendee information will be permanently lost.</strong> This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="bg-gray-300 hover:bg-gray-400 text-black font-medium py-2 px-4 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Delete Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}