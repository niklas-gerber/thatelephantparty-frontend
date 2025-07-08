export interface TicketPurchase {
  id: number;
  event_id: number;
  buyer_name: string;
  phone: string;
  email: string;
  payslip_url: string;
  reference_number: string;
  total_price: number;
  created_at: string | Date;
  attendees?: Attendee[]; // Optional association
  event?: Event; // Optional association
}

export interface TicketPurchaseCreateData {
  quantity: number;
  buyer_name: string;
  phone: string;
  email: string;
  reference_number: string;
  attendees: Array<{ name: string }>;
}