// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// This is the raw shape of data from your API
export interface ApiEvent {
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
  poster_image_url: string; // Assuming it's always provided, as per your note
}

// The function just fetches and returns the raw ApiEvent[]
export async function fetchPublicEvents(): Promise<ApiEvent[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/public/events`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const events: ApiEvent[] = await response.json();
    return events;
  } catch (error) {
    console.error('Failed to fetch events from backend:', error);
    return [];
  }
}