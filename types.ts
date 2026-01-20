
export type UserRole = 'USER' | 'RIDER' | 'ADMIN';

export interface User {
  id: string;
  phoneNumber: string;
  role: UserRole;
  fullName: string;
  address: string;
  lat?: number;
  lng?: number;
  totalEarnings: number;
}

export enum PickupStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  VERIFIED = 'VERIFIED',
  PAYMENT_REQUESTED = 'PAYMENT_REQUESTED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED'
}

export interface WasteType {
  id: string;
  name: string;
  ratePerKg: number;
  color: string;
}

export interface Location {
  lat: number;
  lng: number;
}

export interface PickupRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  requestedWasteType: string; // Type requested by user
  verifiedWasteType?: string; // Final type verified by rider
  status: PickupStatus;
  requestedAt: string;
  verifiedAt?: string;
  imageUrl?: string; // Captured by rider
  verifiedWeight?: number;
  totalAmount?: number;
  address: string;
  location: Location;
  riderId?: string;
}
