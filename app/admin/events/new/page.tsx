// app/admin/events/new/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

export default function NewEventPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latestEvent, setLatestEvent] = useState<Event | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    start_date: ''
  });

  useEffect(() => {
    const fetchLatestEvent = async () => {
      try {
        setIsLoading(true);
        const response = await authFetch('/api/v1/admin/events');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const eventsData: Event[] = await response.json();
        
        // Get the most recent event by start_date
        const sortedEvents = eventsData.sort((a, b) => 
          new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
        );
        
        if (sortedEvents.length > 0) {
          setLatestEvent(sortedEvents[0]);
        }
        
      } catch (err: any) {
        console.error('Failed to fetch latest event:', err);
        
        if (err.message.includes('401') || err.message.includes('Authentication failed')) {
          setError('Authentication required. Redirecting to login...');
          router.push('/admin/login');
        } else {
          setError('Failed to load event data. Please try again later.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestEvent();
  }, [router]);

  // Update the handleSubmit function in app/admin/events/new/page.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);
  setError(null);

  try {
    const formDataToSend = new FormData();
    
    // Add required fields from form
    formDataToSend.append('title', formData.title);
    formDataToSend.append('start_date', formData.start_date);
    
    // Add default values
    formDataToSend.append('display_date', 'Date to be announced');
formDataToSend.append('venue_name', 'Venue to be announced');
formDataToSend.append('venue_address', 'Address to be announced');
formDataToSend.append('event_time', 'Time to be announced');
formDataToSend.append('description', 'Event description to be added');
formDataToSend.append('ticket_price_regular', '100'); // Reasonable default price
formDataToSend.append('ticket_price_bundle', '80'); // Reasonable default bundle price
formDataToSend.append('bundle_size', '2'); // At least 2 for bundle
formDataToSend.append('max_tickets', '100'); // Must be at least 1
formDataToSend.append('ticket_deadline', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]); // 30 days from now
formDataToSend.append('is_active', 'false');
formDataToSend.append('walk_in_price', '120'); // Reasonable default walk-in price

// Use values from latest event or proper defaults
formDataToSend.append('email_template_content', latestEvent?.email_template_content || 'Thank you for your purchase!');
formDataToSend.append('inactive_message', latestEvent?.inactive_message || 'This event is not currently active.');

    const defaultPosterResponse = await fetch('/images/default-poster.jpg');
    if (defaultPosterResponse.ok) {
      const blob = await defaultPosterResponse.blob();
      const file = new File([blob], 'default-poster.jpg', { type: 'image/jpeg' });
      formDataToSend.append('poster', file);
    }

    const response = await authFetch('/api/v1/admin/events', {
      method: 'POST',
      body: formDataToSend,
    });

    if (!response.ok) {
      // Get the error response from the server
      const errorData = await response.text();
      throw new Error(`Server returned ${response.status}: ${errorData}`);
    }

    const newEvent = await response.json();
    router.push(`/admin/events/${newEvent.id}`);
    
  } catch (err: any) {
    console.error('Event creation failed:', err);
    setError(err.message || 'Failed to create event. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center custom-gradient-bg">
        <div className="text-black font-slim">Loading...</div>
      </div>
    );
  }

  if (error && !error.includes('Redirecting')) {
    return (
      <div className="min-h-screen flex items-center justify-center custom-gradient-bg">
        <div className="text-red-500 font-slim">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-8 custom-gradient-bg min-h-screen">
      <div className="flex items-center mb-6">
        <Link 
          href="/admin"
          className="bg-[var(--color-primary)] hover:bg-[#45B8E5] text-black font-medium py-2 px-4 rounded-lg shadow-md transition-colors border border-black mr-4"
        >
          &larr; Back to Dashboard
        </Link>
        <h1 className="text-3xl font-slimbold text-black">Create New Event</h1>
      </div>
      
      <hr className="border-gray-300 mb-8" />

      <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Event Title *
            </label>
            <input
  type="text"
  id="title"
  name="title"
  value={formData.title}
  onChange={handleChange}
  required
  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-black" // Added text-black
  placeholder="Enter event title"
/>
          </div>

          <div>
            <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-2">
              Start Date *
            </label>
            <input
              type="date"
              id="start_date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-black"
            />
          </div>


          <div className="flex justify-end space-x-4 pt-4">
            <Link
              href="/admin"
              className="bg-gray-300 hover:bg-gray-400 text-black font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[var(--color-primary)] hover:bg-[#45B8E5] text-black font-medium py-2 px-6 rounded-lg shadow-md transition-colors border border-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}