// components/EventCard.tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { type ApiEvent } from '@/lib/api'
//import { customLoader } from '@/lib/image-loader' // Import the custom loader

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
    <div className="font-slimbold text-black mx-auto max-w-[40vw] md:max-w-[40vw] p-[3vw] md:p-[3vw]">
      <div className="text-center text-[2.5vw] md:text-[2.5vw] mb-[1vw]">
        {event.title}
      </div>
      
      <Link href={`/tickets?eventId=${event.id}`}>
        <div className="relative aspect-[3/4] w-full my-[4.5vw]">
          <Image
            src={event.poster_image_url}
            alt={`Poster for ${event.title}`}
            fill
            className="object-cover shadow-[0_0_0_3vw_black] hover:shadow-[0_0_0_3.2vw_black] transition-shadow"
            onContextMenu={handleContextMenu}
            unoptimized={true}
            //loader={customLoader} // Add the custom loader here
          />
        </div>
      </Link>

      <Link href={`/tickets?eventId=${event.id}`}>
        <div className="text-center space-y-[0.5vw]">
          <div className="text-[1.5vw] md:text-[1.5vw]">
            <span>{event.venue_name}</span>
          </div>
          <div className="text-[1.5vw] md:text-[1.5vw]">
            <span>{event.display_date}</span>
          </div>
        </div>
      </Link>
    </div>
  )
}