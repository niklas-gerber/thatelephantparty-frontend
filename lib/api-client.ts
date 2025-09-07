// lib/api-client.ts
import { Event, TicketPurchase, Attendee, WalkInCount } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

class ApiClient {

  constructor() {}

private async request<T>(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  path: string,
  body?: any,
  headers: Record<string, string> = {},
  isFormData: boolean = false
): Promise<T> {
  const config: RequestInit = {
    method,
    headers: {
      ...(!isFormData && { 'Content-Type': 'application/json' }),
      ...headers,
    },
    credentials: 'include',
  };

  if (body) {
    config.body = isFormData ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE}${path}`, config);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = {
          message: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status
        };
      }
      
      const error = new Error(errorData.message || 'Request failed');
      // Attach additional error context
      (error as any).status = response.status;
      (error as any).data = errorData;
      throw error;
    }

    if (response.headers.get('Content-Type')?.includes('application/pdf')) {
      return response.blob() as unknown as T;
    }

    return response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}

  // --- Authentication ---
  async login(username: string, password: string): Promise<void> {
    await this.request('POST', '/auth/login', { username, password });
    // No token handling needed - backend sets cookie directly
  }

  logout(): void {
    this.request('POST', '/auth/logout');
  }

  // --- Public Routes ---
  getPublicPage(pagename: string): Promise<any> {
    return this.request('GET', `/public/pages/${pagename}`);
  }

  getPublicEvents(): Promise<Event[]> {
    return this.request('GET', '/public/events');
  }

  getPublicEvent(id: string): Promise<Event> {
    return this.request('GET', `/public/events/${id}`);
  }

purchaseTickets(
  eventId: string,
  data: {
    quantity: number;
    buyer_name: string;
    phone: string;
    email: string;
    reference_number: string;
    attendees: Array<{ name: string }>;
  },
  payslip: File
): Promise<TicketPurchase> {
  const formData = new FormData();
  
  // Append file with correct field name
  formData.append('payslip', payslip);
  
  // Append other fields
  formData.append('quantity', data.quantity.toString());
  formData.append('buyer_name', data.buyer_name);
  formData.append('phone', data.phone);
  formData.append('email', data.email);
  formData.append('reference_number', data.reference_number);
  
  // Format attendees correctly
  data.attendees.forEach((attendee, index) => {
    formData.append(`attendees[${index}][name]`, attendee.name);
  });

  return this.request('POST', `/public/events/${eventId}/purchase`, formData, {}, true);
}

  // --- Admin Routes ---
  // Events
  createEvent(eventData: Omit<Event, 'id'>, poster?: File): Promise<Event> {
    if (poster) {
      const formData = new FormData();
      Object.entries(eventData).forEach(([key, value]) => {
        formData.append(key, value?.toString() ?? '');
      });
      formData.append('file', poster);
      return this.request('POST', '/admin/events', formData, {}, true);
    }
    return this.request('POST', '/admin/events', eventData);
  }

  getEvents(): Promise<Event[]> {
    return this.request('GET', '/admin/events');
  }

  getEvent(id: string): Promise<Event> {
    return this.request('GET', `/admin/events/${id}`);
  }

  updateEvent(id: string, eventData: Partial<Event>, poster?: File): Promise<Event> {
    if (poster) {
      const formData = new FormData();
      Object.entries(eventData).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, value?.toString() ?? '');
        }
      });
      formData.append('file', poster);
      return this.request('PATCH', `/admin/events/${id}`, formData, {}, true);
    }
    return this.request('PATCH', `/admin/events/${id}`, eventData);
  }

  deleteEvent(id: string): Promise<void> {
    return this.request('DELETE', `/admin/events/${id}`);
  }

  // Attendees
  getEventAttendees(eventId: string): Promise<Attendee[]> {
    return this.request('GET', `/admin/events/${eventId}/attendees`);
  }

  toggleAttendeeCheckIn(attendeeId: string): Promise<Attendee> {
    return this.request('PATCH', `/admin/attendees/${attendeeId}/check-in`);
  }

  // Walk-ins
  getWalkInCounts(eventId: string): Promise<WalkInCount> {
    return this.request('GET', `/admin/events/${eventId}/walk-ins`);
  }

  incrementWalkInCount(eventId: string, paymentType: 'cash' | 'gcash'): Promise<WalkInCount> {
    return this.request('POST', `/admin/events/${eventId}/walk-ins/increment`, { payment_type: paymentType });
  }

  decrementWalkInCount(eventId: string, paymentType: 'cash' | 'gcash'): Promise<WalkInCount> {
    return this.request('POST', `/admin/events/${eventId}/walk-ins/decrement`, { payment_type: paymentType });
  }

  // Reports
  getAttendeeListPdf(eventId: string): Promise<Blob> {
    return this.request('GET', `/admin/events/${eventId}/attendee-list`, undefined, {
      Accept: 'application/pdf',
    });
  }

  getAccountingReportPdf(eventId: string): Promise<Blob> {
    return this.request('GET', `/admin/events/${eventId}/accounting`, undefined, {
      Accept: 'application/pdf',
    });
  }

  getEmailListPdf(eventId: string): Promise<Blob> {
    return this.request('GET', `/admin/events/${eventId}/email-list`, undefined, {
      Accept: 'application/pdf',
    });
  }

  // Tickets
  getTickets(): Promise<TicketPurchase[]> {
    return this.request('GET', '/admin/tickets');
  }

  updateTicket(id: string, ticketData: Partial<TicketPurchase>, payslip?: File): Promise<TicketPurchase> {
    if (payslip) {
      const formData = new FormData();
      Object.entries(ticketData).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, value?.toString() ?? '');
        }
      });
      formData.append('file', payslip);
      return this.request('PATCH', `/admin/tickets/${id}`, formData, {}, true);
    }
    return this.request('PATCH', `/admin/tickets/${id}`, ticketData);
  }

  deleteTicket(id: string): Promise<void> {
    return this.request('DELETE', `/admin/tickets/${id}`);
  }
}

export const apiClient = new ApiClient();