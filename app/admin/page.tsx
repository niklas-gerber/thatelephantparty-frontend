// app/admin/page.tsx
'use client';

import { useEffect, useState } from 'react';
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

export default function AdminDashboardPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchEventsData = async () => {
      try {
        setIsLoading(true);
        const response = await authFetch('/api/v1/admin/events');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const eventsData: Event[] = await response.json();
        
        // Sort events by start_date (most recent first)
        const sortedEvents = eventsData.sort((a, b) => 
          new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
        );
        
        setEvents(sortedEvents);
        
      } catch (err: any) {
        console.error('Events fetch failed:', err);
        
        if (err.message.includes('401') || err.message.includes('Authentication failed')) {
          setError('Authentication required. Redirecting to login...');
          router.push('/admin/login');
        } else {
          setError('Failed to load events data. Please try again later.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventsData();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center custom-gradient-bg">
        <div className="text-black font-slim">Loading events...</div>
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

  // Separate active and inactive events
  const activeEvents = events.filter(event => event.is_active);
  const inactiveEvents = events.filter(event => !event.is_active);

  return (
    <div className="p-8 custom-gradient-bg min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-slimbold text-black">Event Management Dashboard</h1>
        <Link 
  href="/admin/events/new"
  className="bg-[var(--color-primary)] hover:bg-[#45B8E5] text-black font-medium py-3 px-6 rounded-lg shadow-md transition-colors border border-black"
>
  Create New Event
</Link>
      </div>
      
      <hr className="border-gray-300 mb-8" />
      
      {/* Active Events Section */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-slimbold text-[var(--color-primary)]">Active Events</h2>
          <span className="text-gray-600 bg-gray-100 px-3 py-1 rounded-full text-sm">
            {activeEvents.length} events
          </span>
        </div>
        
        <hr className="border-gray-200 mb-4" />
        
        {activeEvents.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {activeEvents.map((event, index) => (
              <Link 
                key={event.id} 
                href={`/admin/events/${event.id}`}
                className={`block p-4 hover:bg-gray-50 transition-colors ${index < activeEvents.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-[var(--color-primary)] mb-1">{event.title}</h3>
                    <div className="text-sm text-gray-600">
                      <span className="mr-4">
                        <strong>Date:</strong> {new Date(event.start_date).toLocaleDateString()}
                      </span>
                      <span>
                        <strong>Tickets Sold:</strong> {event.sold_tickets}
                      </span>
                    </div>
                  </div>
                  <div className="text-elephant-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">No active events</p>
          </div>
        )}
      </div>

      {/* Inactive Events Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
<h2 className="text-2xl font-slimbold text-[var(--color-primary)]">Inactive Events</h2>
<button
  onClick={() => setShowInactive(!showInactive)}
  className="bg-[var(--color-primary)] hover:bg-[#45B8E5] text-black font-medium px-3 py-1 rounded-md transition-colors border border-black"
>
  {showInactive ? 'Hide' : 'Show'} ({inactiveEvents.length})
</button>
        </div>
        
        <hr className="border-gray-200 mb-4" />
        
        {showInactive && (
          inactiveEvents.length > 0 ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {inactiveEvents.map((event, index) => (
                <Link 
                  key={event.id} 
                  href={`/admin/events/${event.id}`}
                  className={`block p-4 hover:bg-gray-50 transition-colors ${index < inactiveEvents.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium text-[var(--color-primary)] mb-1">{event.title}</h3>
                      <div className="text-sm text-gray-600">
                        <span className="mr-4">
                          <strong>Date:</strong> {new Date(event.start_date).toLocaleDateString()}
                        </span>
                        <span>
                          <strong>Tickets Sold:</strong> {event.sold_tickets}
                        </span>
                      </div>
                    </div>
<div className="text-[var(--color-primary)]">
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
  </svg>
</div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-500">No inactive events</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}