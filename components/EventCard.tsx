'use client'

import Image from 'next/image'
import Link from 'next/link'
import { type ApiEvent } from '@/lib/api'

export default function EventCard({
  event,
  isUpcoming = false
}: {
  event: ApiEvent
  isUpcoming?: boolean
}) {
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
  }

  return (
    <div className="font-slimbold text-black mx-auto w-full max-w-[90vw] md:max-w-[40vw] p-4 md:p-8">
      {/* Removed outline from event title */}
      <div className="text-center text-xl md:text-2xl lg:text-3xl mb-2 md:mb-4 px-4 py-2 w-full mx-auto">
        {event.title}
      </div>
      
      <Link href={`/tickets?eventId=${event.id}`} className="flex justify-center">
        <Image
          src={event.poster_image_url}
          alt={`Poster for ${event.title}`}
          width={400}
          height={600}
          className="block mx-auto w-full max-w-[80vw] md:max-w-[40vw] shadow-[0_0_0_2vw] md:shadow-[0_0_0_3vw] shadow-black hover:shadow-[0_0_0_2.2vw] md:hover:shadow-[0_0_0_3.2vw] transition-all duration-300 my-4 md:my-8"
          onContextMenu={handleContextMenu}
          unoptimized={true}
        />
      </Link>

      <Link href={`/tickets?eventId=${event.id}`}>
        <div className="mt-2 md:mt-4 space-y-1 md:space-y-2">
          <div className="text-center text-base md:text-lg lg:text-xl">
            <span>{event.venue_name}</span>
          </div>
          <div className="text-center text-base md:text-lg lg:text-xl">
            <span>{event.display_date}</span>
          </div>
        </div>
      </Link>
    </div>
  )
}