export interface Attendee {
  id: number;
  ticket_purchase_id: number;
  name: string;
  is_primary: boolean;
  checked_in: boolean;
  ticketPurchase?: TicketPurchase; // Optional association
}