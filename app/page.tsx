// app/page.tsx
import { Suspense } from 'react'
import EventCardWrapper from '@/components/EventCardWrapper'
import Pagination from '@/components/Pagination'
import { fetchPublicEvents, type ApiEvent } from '@/lib/api'

export const revalidate = 3000

async function EventsList({ page }: { page: number }) {
  const eventsPerPage = 5
  const allEvents: ApiEvent[] = await fetchPublicEvents()
  const totalPages = Math.ceil(allEvents.length / eventsPerPage)
  
  const paginatedEvents = allEvents.slice(
    (page - 1) * eventsPerPage,
    page * eventsPerPage
  )

  return (
    <>
      {page === 1 && (
        <>
          <div className="text-center font-slimbold text-[3vw] md:text-[2vw] py-[1vw] border-2 border-black w-fit mx-auto mb-[2.5vw]">
            UPCOMING EVENTS
          </div>
          
          {paginatedEvents[0] && (
            <EventCardWrapper event={paginatedEvents[0]} isUpcoming />
          )}

          <div className="text-center font-slimbold text-[3vw] md:text-[2vw] py-[1vw] border-2 border-black w-fit mx-auto my-[2.5vw]">
            PAST EVENTS
          </div>
        </>
      )}

      <div className="space-y-[4vw] md:space-y-[4vw]">
        {paginatedEvents.map((event, index) => (
          (page !== 1 || index !== 0) && (
            <EventCardWrapper key={event.id} event={event} />
          )
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-[4vw]">
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
    <div className="pb-[5vw]">
      <div className="h-[10vw]"></div>
      <Suspense fallback={<div>Loading events...</div>}>
        <EventsList page={page} />
      </Suspense>
    </div>
  )
}