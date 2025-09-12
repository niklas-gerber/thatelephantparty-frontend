// app/admin/events/[id]/downloads/page.tsx
'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import authFetch from '@/lib/api-admin';

interface Event {
  id: number;
  title: string;
  display_date: string;
  venue_name: string;
  venue_address: string;
}

export default function EventDownloadsPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  useState(() => {
    const fetchEventData = async () => {
      try {
        setIsLoading(true);
        const response = await authFetch(`/api/v1/admin/events/${eventId}`);
        
        if (!response.ok) {
          if (response.status === 401) {
            setError('Authentication required. Redirecting to login...');
            setTimeout(() => router.push('/admin/login'), 1500);
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const eventData: Event = await response.json();
        setEvent(eventData);
        
      } catch (err: any) {
        console.error('Event fetch failed:', err);
        if (err.message.includes('401') || err.message.includes('Authentication failed')) {
          setError('Authentication required. Redirecting to login...');
          setTimeout(() => router.push('/admin/login'), 1500);
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
  });

  const handleDownload = async (endpoint: string, filename: string) => {
    try {
      setIsDownloading(filename);
      setError(null);

      const response = await authFetch(`/api/v1/admin/events/${eventId}/${endpoint}`);
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('Authentication required. Redirecting to login...');
          setTimeout(() => router.push('/admin/login'), 1500);
          return;
        }
        throw new Error(`Failed to download ${filename}`);
      }

      // Create a blob from the response
      const blob = await response.blob();
      
      // Create a download link and trigger the download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${event?.title.replace(/[^\w]/g, '_')}_${filename}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (err: any) {
      console.error('Download failed:', err);
      if (err.message.includes('401') || err.message.includes('Authentication failed')) {
        setError('Authentication required. Redirecting to login...');
        setTimeout(() => router.push('/admin/login'), 1500);
      } else {
        setError(err.message || `Failed to download ${filename}. Please try again.`);
      }
    } finally {
      setIsDownloading(null);
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
        <h1 className="text-3xl font-slimbold text-black">Download Reports</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Event Info */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-2xl font-slimbold text-[var(--color-primary)] mb-2">{event.title}</h2>
        <p className="text-black">{event.display_date} at {event.venue_name}</p>
        <p className="text-black">{event.venue_address}</p>
      </div>

      {/* Download Options */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-slimbold text-[var(--color-primary)] mb-6">Available Reports</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Attendee List */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-slimbold text-[var(--color-primary)] mb-2">Attendee List</h3>
            <p className="text-gray-600 text-sm mb-4">
              Download a list of all attendees with their names grouped by ticket purchase (PDF).
            </p>
            <button
              onClick={() => handleDownload('attendee-list', 'Attendees')}
              disabled={!!isDownloading}
              className="bg-[var(--color-primary)] hover:bg-[#45B8E5] text-black font-medium py-2 px-4 rounded transition-colors border border-black disabled:opacity-50 disabled:cursor-not-allowed w-full"
            >
              {isDownloading === 'Attendees' ? 'Downloading...' : 'Download Attendee List'}
            </button>
          </div>

          {/* Financial Report */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-slimbold text-[var(--color-primary)] mb-2">Financial Report</h3>
            <p className="text-gray-600 text-sm mb-4">
              Generate a accounting report with ticket sales, walk-in counts, and total revenue (PDF).
            </p>
            <button
              onClick={() => handleDownload('accounting', 'Accounting')}
              disabled={!!isDownloading}
              className="bg-[var(--color-primary)] hover:bg-[#45B8E5] text-black font-medium py-2 px-4 rounded transition-colors border border-black disabled:opacity-50 disabled:cursor-not-allowed w-full"
            >
              {isDownloading === 'Accounting' ? 'Downloading...' : 'Download Financial Report'}
            </button>
          </div>

          {/* Email List */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-slimbold text-[var(--color-primary)] mb-2">Email List</h3>
            <p className="text-gray-600 text-sm mb-4">
              Export all buyer email addresses for sending event updates (PDF).
            </p>
            <button
              onClick={() => handleDownload('email-list', 'Emails')}
              disabled={!!isDownloading}
              className="bg-[var(--color-primary)] hover:bg-[#45B8E5] text-black font-medium py-2 px-4 rounded transition-colors border border-black disabled:opacity-50 disabled:cursor-not-allowed w-full"
            >
              {isDownloading === 'Emails' ? 'Downloading...' : 'Download Email List'}
            </button>
          </div>
        </div>

       
      </div>
    </div>
  );
}