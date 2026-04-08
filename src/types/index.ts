export type UserRole = 'OPERATOR' | 'OWNER';

export type BookingStatus = 'INQUIRY' | 'CONFIRMED' | 'FULLY_PAID' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';

export type UnitStatus = 'AVAILABLE' | 'MAINTENANCE';

export type PaymentType = 'DP' | 'PELUNASAN' | 'SECURITY_DEPOSIT' | 'REFUND';

export type PaymentMethod = 'CASH' | 'TRANSFER' | 'QRIS';

export type BookingSource = 'WHATSAPP' | 'INSTAGRAM' | 'WALK_IN' | 'REFERRAL' | 'AIRBNB' | 'TRAVELOKA' | 'OTHER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Owner {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export interface Villa {
  id: string;
  name: string;
  address: string;
  city: string;
  ownerId: string;
  cctvLink?: string;
}

export interface Unit {
  id: string;
  villaId: string;
  label: string;
  pricePerNight: number;
  status: UnitStatus;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  type: PaymentType;
  method: PaymentMethod;
  paidAt: string;
}

export interface Booking {
  id: string;
  unitId: string;
  guestName: string;
  guestPhone: string;
  guestCount: number;
  source: BookingSource;
  checkIn: string;
  checkOut: string;
  nights: number;
  pricePerNight: number;
  totalPrice: number;
  status: BookingStatus;
  notes?: string;
  payments: Payment[];
}
