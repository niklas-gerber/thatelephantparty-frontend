// lib/api.ts

// Fallback für Client und Server
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Browser: Nutzt die öffentliche URL (localhost)
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
  }
  // Server/Docker: Nutzt den internen Docker-Namen
  return 'http://backend:3000/api/v1';
};

export interface ApiEvent {
  id: number;
  title: string;
  display_date: string;
  start_date: string; // Wichtig: Hier hinzugefügt
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
}

export async function fetchPublicEvents(): Promise<ApiEvent[]> {
  try {
    const API_BASE = getBaseUrl();
    const response = await fetch(`${API_BASE}/public/events`, {
      cache: 'no-store' // Verhindert veraltete Daten
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch events from backend:', error);
    return [];
  }
}

export async function fetchPublicEvent(id: string): Promise<ApiEvent | null> {
  try {
    const API_BASE = getBaseUrl();
    const response = await fetch(`${API_BASE}/public/events/${id}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch event');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching event:', error);
    return null;
  }
}

export interface PageContent {
  id: number;
  name: string;
  content: string;
  lastUpdated: string;
}

export async function fetchPageContent(pageName: string): Promise<PageContent | null> {
  try {
    const API_BASE = getBaseUrl();
    const response = await fetch(`${API_BASE}/public/pages/${pageName}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch ${pageName} page content:`, error);
    return null;
  }
}