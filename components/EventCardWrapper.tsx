// components/EventCardWrapper.tsx
import EventCard from './EventCard'
import { type ApiEvent } from '@/lib/api' // Import the type

export default function EventCardWrapper({
  event,
  isUpcoming = false
}: {
  event: ApiEvent // Use the API type here too
  isUpcoming?: boolean
}) {
  return <EventCard event={event} isUpcoming={isUpcoming} />
}