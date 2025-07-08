export interface Event {
  id: number;
  title: string;
  display_date: string;
  venue_name: string;
  venue_address: string;
  event_time: string;
  description: string;
  email_template_content: string;
  ticket_price_regular: number;
  ticket_price_bundle?: number | null;
  bundle_size?: number | null;
  max_tickets: number;
  sold_tickets: number;
  ticket_deadline: string | Date;
  is_active: boolean;
  inactive_message?: string | null;
  start_date: string | Date;
  walk_in_price: number;
  walk_in_cash_count: number;
  walk_in_gcash_count: number;
  poster_image_url?: string | null;
}

export type WalkInCount = {
  cash: number;
  gcash: number;
};