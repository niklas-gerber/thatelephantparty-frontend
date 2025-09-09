// app/page.tsx
import { Suspense } from 'react'
import EventCardWrapper from '@/components/EventCardWrapper'
import Pagination from '@/components/Pagination'
import { fetchPublicEvents, type ApiEvent } from '@/lib/api'

export const revalidate = 3000

// Helper function to categorize and sort events
function processEvents(events: ApiEvent[]) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()) // Today at midnight
  
  const upcomingEvents: ApiEvent[] = []
  const pastEvents: ApiEvent[] = []
  
  events.forEach(event => {
    const eventDate = new Date(event.start_date)
    // Compare dates without time component
    const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate())
    
    if (eventDateOnly >= today) {
      upcomingEvents.push(event)
    } else {
      pastEvents.push(event)
    }
  })
  
  // Sort upcoming events: soonest first
  upcomingEvents.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
  
  // Sort past events: most recent first
  pastEvents.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
  
  return { upcomingEvents, pastEvents }
}

async function EventsList({ page }: { page: number }) {
  const eventsPerPage = 5
  const allEvents: ApiEvent[] = await fetchPublicEvents()
  const { upcomingEvents, pastEvents } = processEvents(allEvents)
  
  // Combine all events for pagination (upcoming first, then past)
  const combinedEvents = [...upcomingEvents, ...pastEvents]
  const totalPages = Math.ceil(combinedEvents.length / eventsPerPage)
  
  const paginatedEvents = combinedEvents.slice(
    (page - 1) * eventsPerPage,
    page * eventsPerPage
  )

  return (
    <>
      {page === 1 && (
        <>
          {/* Upcoming Events Section - Only show if there are upcoming events */}
          {upcomingEvents.length > 0 && (
            <>
              <div className="text-center font-slimbold text-xl md:text-2xl px-6 py-4 outline outline-2 outline-black w-fit mx-auto mb-8 text-black">
                UPCOMING EVENTS
              </div>
              
              {upcomingEvents.slice(0, 1).map(event => (
                <EventCardWrapper key={event.id} event={event} isUpcoming />
              ))}
            </>
          )}

          {/* Past Events Section */}
          <div className="text-center font-slimbold text-xl md:text-2xl px-6 py-4 outline outline-2 outline-black w-fit mx-auto my-8 text-black">
            PAST EVENTS
          </div>
        </>
      )}

      {/* Show remaining events */}
      <div className="space-y-8 md:space-y-12">
        {paginatedEvents.map((event, index) => {
          // Skip the first upcoming event if we're on page 1 (it was already shown separately)
          if (page === 1 && index === 0 && upcomingEvents.length > 0) {
            return null
          }
          
          return <EventCardWrapper key={event.id} event={event} />
        })}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 md:mt-12">
          <Pagination currentPage={page} totalPages={totalPages} />
        </div>
      )}
    </>
  )
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const params = await searchParams;
  const page = parseInt(params?.page || '1') || 1;

  return (
    <div className="pb-8 md:pb-12">
      <div className="h-8 md:h-12"></div>
      <Suspense fallback={<div className="text-center py-8 text-black">Loading events...</div>}>
        <EventsList page={page} />
      </Suspense>
    </div>
  )
}