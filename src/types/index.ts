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
  ownerName?: string; // The specific owner of this kavling
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

export interface Expense {
  id: string;
  villaId: string;
  unitId?: string; // Optional: associated with a specific unit/kavling
  label: string;
  amount: number;
  date: string;
  category: string;
  note?: string;
}

export interface VillaSettings {
  checkInTime: string;
  checkOutTime: string;
  whatsappNotifications: boolean;
  emailReports: boolean;
  currency: string;
}

export type PricingRuleType = 'WEEKEND' | 'SEASONAL' | 'SPECIFIC_DATE';

export interface PricingRule {
  id: string;
  villaId: string;
  type: PricingRuleType;
  label: string;
  adjustmentType: 'FIXED' | 'PERCENTAGE';
  adjustmentValue: number; // Positive for increase, negative for discount
  startDate?: string; // For Seasonal/Specific
  endDate?: string;   // For Seasonal
  daysOfWeek?: number[]; // 0 for Sunday, 6 for Saturday. For WEEKEND [5, 6]
  active: boolean;
}

export interface Blackout {
  id: string;
  unitId: string;
  startDate: string;
  endDate: string;
  reason?: string;
  createdAt: string;
}
