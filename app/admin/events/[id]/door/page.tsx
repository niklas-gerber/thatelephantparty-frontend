// app/admin/events/[id]/door/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import authFetch from '@/lib/api-admin';

interface Attendee {
    id: number;
    name: string;
    checked_in: boolean;
    is_primary: boolean;
    group_identifier: string;
}

interface Event {
    id: number;
    title: string;
    display_date: string;
    venue_name: string;
    venue_address: string;
    event_time: string;
    sold_tickets: number;
    walk_in_cash_count: number;
    walk_in_gcash_count: number;
    walk_in_price: number;
}

export default function DoorManagementPage() {
    const router = useRouter();
    const params = useParams();
    const eventId = params.id as string;

    const [event, setEvent] = useState<Event | null>(null);
    const [attendees, setAttendees] = useState<Attendee[]>([]);
    const [filteredAttendees, setFilteredAttendees] = useState<Attendee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Fetch event data
                const eventResponse = await authFetch(`/api/v1/admin/events/${eventId}`);
                if (!eventResponse.ok) {
                    if (eventResponse.status === 401) {
                        setError('Authentication required. Redirecting to login...');
                        setTimeout(() => router.push('/admin/login'), 1500);
                        return;
                    }
                    throw new Error('Failed to fetch event');
                }
                const eventData: Event = await eventResponse.json();
                setEvent(eventData);

                // Fetch all attendees
                const attendeesResponse = await authFetch(`/api/v1/admin/events/${eventId}/attendees`);
                if (!attendeesResponse.ok) {
                    if (attendeesResponse.status === 401) {
                        setError('Authentication required. Redirecting to login...');
                        setTimeout(() => router.push('/admin/login'), 1500);
                        return;
                    }
                    throw new Error('Failed to fetch attendees');
                }
                const attendeesData: Attendee[] = await attendeesResponse.json();
                setAttendees(attendeesData);
                setFilteredAttendees(attendeesData);

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

    // Filter attendees based on search term
    useEffect(() => {
        if (!searchTerm) {
            setFilteredAttendees(attendees);
            return;
        }

        const lowercasedTerm = searchTerm.toLowerCase();
        const filtered = attendees.filter(attendee =>
            attendee.name.toLowerCase().includes(lowercasedTerm) ||
            attendee.group_identifier.toLowerCase().includes(lowercasedTerm)
        );

        setFilteredAttendees(filtered);
    }, [searchTerm, attendees]);

    // Group attendees by their group_identifier
    const groupedAttendees = useMemo(() => {
        const groups: Record<string, Attendee[]> = {};

        filteredAttendees.forEach(attendee => {
            if (!groups[attendee.group_identifier]) {
                groups[attendee.group_identifier] = [];
            }
            groups[attendee.group_identifier].push(attendee);
        });

        return groups;
    }, [filteredAttendees]);

    const handleCheckInToggle = async (attendeeId: number) => {
        try {
            setIsSubmitting(true);
            setError(null);
            setSuccess(null);

            const response = await authFetch(`/api/v1/admin/attendees/${attendeeId}/check-in`, {
                method: 'PATCH',
            });

            if (!response.ok) {
                if (response.status === 401) {
                    setError('Authentication required. Redirecting to login...');
                    setTimeout(() => router.push('/admin/login'), 1500);
                    return;
                }
                throw new Error('Failed to update check-in status');
            }

            const updatedAttendee = await response.json();

            // Update the attendee in the state
            setAttendees(prev => prev.map(a =>
                a.id === attendeeId ? { ...a, checked_in: updatedAttendee.checked_in } : a
            ));

            setSuccess(`Successfully ${updatedAttendee.checked_in ? 'checked in' : 'checked out'} ${updatedAttendee.name}`);

        } catch (err: any) {
            console.error('Check-in toggle failed:', err);
            if (err.message.includes('401') || err.message.includes('Authentication failed')) {
                setError('Authentication required. Redirecting to login...');
                setTimeout(() => router.push('/admin/login'), 1500);
            } else {
                setError(err.message || 'Failed to update check-in status. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleWalkInIncrement = async (paymentType: 'cash' | 'gcash') => {
        try {
            setIsSubmitting(true);
            setError(null);
            setSuccess(null);

            const response = await authFetch(`/api/v1/admin/events/${eventId}/walk-ins/increment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ payment_type: paymentType }),
            });

            if (!response.ok) {
                if (response.status === 401) {
                    setError('Authentication required. Redirecting to login...');
                    setTimeout(() => router.push('/admin/login'), 1500);
                    return;
                }
                throw new Error('Failed to update walk-in count');
            }

            const result = await response.json();

            // Update the event in the state
            setEvent(prev => prev ? {
                ...prev,
                [`walk_in_${paymentType}_count`]: result[`walk_in_${paymentType}_count`]
            } : null);

            setSuccess(`Successfully incremented ${paymentType} walk-in count`);

        } catch (err: any) {
            console.error('Walk-in increment failed:', err);
            if (err.message.includes('401') || err.message.includes('Authentication failed')) {
                setError('Authentication required. Redirecting to login...');
                setTimeout(() => router.push('/admin/login'), 1500);
            } else {
                setError(err.message || 'Failed to update walk-in count. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleWalkInDecrement = async (paymentType: 'cash' | 'gcash') => {
        try {
            setIsSubmitting(true);
            setError(null);
            setSuccess(null);

            const response = await authFetch(`/api/v1/admin/events/${eventId}/walk-ins/decrement`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ payment_type: paymentType }),
            });

            if (!response.ok) {
                if (response.status === 401) {
                    setError('Authentication required. Redirecting to login...');
                    setTimeout(() => router.push('/admin/login'), 1500);
                    return;
                }
                throw new Error('Failed to update walk-in count');
            }

            const result = await response.json();

            // Update the event in the state
            setEvent(prev => prev ? {
                ...prev,
                [`walk_in_${paymentType}_count`]: result[`walk_in_${paymentType}_count`]
            } : null);

            setSuccess(`Successfully decremented ${paymentType} walk-in count`);

        } catch (err: any) {
            console.error('Walk-in decrement failed:', err);
            if (err.message.includes('401') || err.message.includes('Authentication failed')) {
                setError('Authentication required. Redirecting to login...');
                setTimeout(() => router.push('/admin/login'), 1500);
            } else {
                setError(err.message || 'Failed to update walk-in count. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Calculate totals
    const checkedInCount = attendees.filter(a => a.checked_in).length;
    const totalWalkIns = (event?.walk_in_cash_count || 0) + (event?.walk_in_gcash_count || 0);
    const totalGuests = checkedInCount + totalWalkIns;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center custom-gradient-bg">
                <div className="text-black font-slim">Loading door management...</div>
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
        <div className="p-4 md:p-8 custom-gradient-bg min-h-screen">
            {/* Header Navigation */}
            <div className="flex items-center mb-6">
                <Link
                    href={`/admin/events/${eventId}`}
                    className="bg-[var(--color-primary)] hover:bg-[#45B8E5] text-black font-medium py-2 px-4 rounded-lg shadow-md transition-colors border border-black mr-4"
                >
                    &larr; Back to Event
                </Link>
                <h1 className="text-2xl md:text-3xl font-slimbold text-black">Door Management</h1>
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

            {/* Event Stats Card */}
            <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-6">
                <h2 className="text-xl font-slimbold text-[var(--color-primary)] mb-4">{event.title}</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Total Guests</p>
                        <p className="text-2xl font-bold text-black">{totalGuests}</p>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-600">Checked In</p>
                        <p className="text-2xl font-bold text-black">{checkedInCount} / {attendees.length}</p>
                    </div>

                    <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-sm text-green-600">Total Walk-ins</p>
                        <p className="text-2xl font-bold text-black">{totalWalkIns}</p>
                    </div>

                    <div className="bg-yellow-50 p-3 rounded-lg">
                        <p className="text-sm text-yellow-600">Walk-in Price</p>
                        <p className="text-2xl font-bold text-black">₱{event.walk_in_price}</p>
                    </div>
                </div>

                {/* Walk-in Controls */}
                <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-lg font-slimbold text-[var(--color-primary)] mb-3">Walk-in Management</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                                <p className="text-sm text-gray-600">Cash Walk-ins</p>
                                <p className="text-xl font-bold text-black">{event.walk_in_cash_count}</p>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleWalkInDecrement('cash')}
                                    disabled={isSubmitting || event.walk_in_cash_count <= 0}
                                    className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-medium py-1 px-3 rounded transition-colors text-sm"
                                >
                                    -
                                </button>
                                <button
                                    onClick={() => handleWalkInIncrement('cash')}
                                    disabled={isSubmitting}
                                    className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-medium py-1 px-3 rounded transition-colors text-sm"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                                <p className="text-sm text-gray-600">GCash Walk-ins</p>
                                <p className="text-xl font-bold text-black">{event.walk_in_gcash_count}</p>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleWalkInDecrement('gcash')}
                                    disabled={isSubmitting || event.walk_in_gcash_count <= 0}
                                    className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-medium py-1 px-3 rounded transition-colors text-sm"
                                >
                                    -
                                </button>
                                <button
                                    onClick={() => handleWalkInIncrement('gcash')}
                                    disabled={isSubmitting}
                                    className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-medium py-1 px-3 rounded transition-colors text-sm"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

{/* Search and Attendee List */}
<div className="bg-white rounded-lg shadow p-4 md:p-6">
  <div className="mb-4">
    <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
      Search Attendees
    </label>
    <input
      type="text"
      id="search"
      placeholder="Search by name or group..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-black"
    />
  </div>

  <div className="overflow-hidden">
    <div className="overflow-y-auto max-h-96">
      {attendees.length > 0 ? (
        // Get all unique groups first
        Array.from(new Set(attendees.map(a => a.group_identifier))).map(groupName => {
          // Get all attendees in this group
          const groupAttendees = attendees.filter(a => a.group_identifier === groupName);
          
          // Sort group: primary attendee (where group_identifier === name) first
          const sortedGroup = [...groupAttendees].sort((a, b) => {
            if (a.name === groupName && b.name !== groupName) return -1;
            if (a.name !== groupName && b.name === groupName) return 1;
            return 0;
          });
          
          // Check if any attendee in this group matches the search
          const groupHasMatch = searchTerm && sortedGroup.some(attendee => 
            attendee.name.toLowerCase().includes(searchTerm.toLowerCase())
          );
          
          // Only show group if there's no search term or if it has a match
          if (!searchTerm || groupHasMatch) {
            return (
              <div key={groupName} className="mb-4 last:mb-0">
                {sortedGroup.map(attendee => {
                  const isMatch = searchTerm && 
                    attendee.name.toLowerCase().includes(searchTerm.toLowerCase());
                  
                  const isPrimary = attendee.name === groupName;
                  
                  return (
                    <div 
                      key={attendee.id} 
                      className={`flex items-center justify-between py-2 px-3 mb-1 rounded-md ${isMatch ? 'bg-yellow-50' : ''}`}
                    >
                      <div className={`${isPrimary ? 'text-[var(--color-primary)] font-medium' : 'text-black ml-4'}`}>
                        {attendee.name}
                      </div>
                      
                      <button
                        onClick={() => handleCheckInToggle(attendee.id)}
                        disabled={isSubmitting}
                        className={`px-3 py-1 rounded text-sm font-medium ${
                          attendee.checked_in 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        } disabled:opacity-50`}
                      >
                        {attendee.checked_in ? 'Checked In' : 'Check In'}
                      </button>
                    </div>
                  );
                })}
              </div>
            );
          }
          return null;
        })
      ) : (
        <div className="text-center py-4 text-gray-500">
          {searchTerm ? 'No attendees match your search' : 'No attendees found for this event'}
        </div>
      )}
    </div>
  </div>
</div>
        </div>
    );
}