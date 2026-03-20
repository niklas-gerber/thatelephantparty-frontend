// app/events/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { fetchPublicEvent } from '@/lib/api';

interface ApiEvent {
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
  is_active: boolean;
  inactive_message: string | null;
  poster_image_url: string;
  start_date: string;
}

export default function EventDetailPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [event, setEvent] = useState<ApiEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const eventData = await fetchPublicEvent(id);
        
        if (!eventData) {
          notFound();
        }
        
        setEvent(eventData);
      } catch (err: any) {
        console.error('Failed to load event:', err);
        setError('Failed to load event. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadEvent();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen custom-gradient-bg flex items-center justify-center">
        <div className="text-black font-slim">Loading event...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen custom-gradient-bg flex items-center justify-center">
        <div className="text-red-500 font-slim">{error}</div>
      </div>
    );
  }

  if (!event) {
    notFound();
  }

  // Determine if event is in the future
  let isFutureEvent = false;
  if (event.start_date) {
    const eventDate = new Date(event.start_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
    isFutureEvent = eventDate >= today;
  }

  return (
    <div className="min-h-screen custom-gradient-bg pb-8 md:pb-12">
      <div className="h-12 md:h-16"></div>
      
      {/* Event Header with horizontal line */}
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
          width={400}
          height={600}
          className="w-full max-w-[80vw] md:max-w-[40vw] shadow-[0_0_0_2vw] md:shadow-[0_0_0_3vw] shadow-black"
          unoptimized={true}
        />
      </div>

      {/* Event Details - No white card, no frames */}
      <div className="max-w-2xl mx-auto px-6 mb-8 md:mb-12 space-y-6 text-black">
        {/* Event Info (formerly When & Where) */}
        <div className="text-center space-y-2">
          <p className="text-lg md:text-xl">{event.display_date}</p>
          <p className="text-lg md:text-xl">{event.event_time}</p>
          <p className="text-lg md:text-xl">{event.venue_name}</p>
          <p className="text-md md:text-lg">{event.venue_address}</p>
        </div>

        {/* Description without headline */}
        {event.description && (
          <div className="text-center">
            <p className="text-md md:text-lg leading-relaxed">
              {event.description}
            </p>
          </div>
        )}
        
        {/* Show content only for future events */}
        {isFutureEvent && (
          <>
            {/* Active future event - show prices and button */}
            {event.is_active ? (
              <>
                {/* Pricing - Simplified */}
                <div className="text-center">
                  {event.ticket_price_bundle && event.bundle_size ? (
                    <div className="space-y-1">
                      <p className="text-lg md:text-xl">
                        Regular: ₱{event.ticket_price_regular}
                      </p>
                      <p className="text-lg md:text-xl">
                        Bundle for {event.bundle_size}: ₱{event.ticket_price_bundle}
                      </p>
                    </div>
                  ) : (
                    <p className="text-lg md:text-xl">
                      ₱{event.ticket_price_regular}
                    </p>
                  )}
                </div>

                {/* Purchase Button */}
                <div className="text-center px-6 mt-6">
                  <Link href={`/events/${event.id}/purchase`}>
                    <button className="bg-[var(--color-primary)] hover:bg-[#45B8E5] text-black font-slimbold text-xl md:text-2xl px-8 md:px-12 py-4 md:py-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-black">
                      BUY TICKETS
                    </button>
                  </Link>
                </div>
              </>
            ) : (
              /* Inactive future event - show message only */
              event.inactive_message && (
                <div className="text-center px-6 mt-6">
                  <div className="bg-[var(--color-primary)]/20 border border-[var(--color-primary)] text-[var(--color-primary)] px-4 py-3 rounded-lg max-w-2xl mx-auto">
                    <p className="font-slimbold">{event.inactive_message}</p>
                  </div>
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}