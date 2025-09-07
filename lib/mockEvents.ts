export const mockEvents = Array.from({ length: 10 }, (_, i) => ({
  id: `${i+1}`,
  title: `Event ${i+1}`,
  date: new Date(Date.now() + i * 86400000).toISOString(),
  venue: `Venue ${i+1}`,
  posterUrl: '/elephantlogo.png' // Use your logo as placeholder
}))