export interface User {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  role: 'OWNER' | 'ADMIN';
  createdAt: string;
}

export interface Vessel {
  id: number;
  ownerId: number;
  name: string;
  type: string;
  registrationNumber: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNotes?: string;
  createdAt: string;
}

export interface Route {
  id: number;
  name: string;
  origin: string;
  destination: string;
  distanceKm?: number;
  fee: number;
  isActive: boolean;
  createdAt: string;
}

export interface Pilot {
  id: number;
  name: string;
  email: string;
  phone?: string;
  licenseNumber: string;
  isAvailable: boolean;
  createdAt: string;
}

export interface Booking {
  id: number;
  ownerId: number;
  ownerName?: string;
  vesselId: number;
  vesselName?: string;
  routeId: number;
  routeName?: string;
  origin?: string;
  destination?: string;
  pilotId?: number;
  pilotName?: string;
  couponId?: number;
  couponCode?: string;
  status: 'PENDING' | 'APPROVED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
  totalFee: number;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: number;
  code: string;
  ownerId: number;
  ownerName?: string;
  amount: number;
  status: 'ACTIVE' | 'USED' | 'EXPIRED';
  issuedAt: string;
  purchasedAt?: string;
  usedAt?: string;
  expiresAt: string;
}

export interface CouponValidationResult {
  valid: boolean;
  couponCode: string;
  couponAmount: number;
  routeFee: number;
  discount?: number;
  finalAmount?: number;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  approvedBookings: number;
  completedBookings: number;
  rejectedBookings: number;
  totalUsers: number;
  totalPilots: number;
  activePilots: number;
  totalVessels: number;
  pendingVessels: number;
  totalRevenue: number;
  totalRevenueAmount: number;
}

export interface MyBookingStats {
  totalBookings: number;
  pendingBookings: number;
  approvedBookings: number;
  completedBookings: number;
  rejectedBookings: number;
  totalSpent: number;
  activeCoupons: number;
}

export interface BookingAnalytics {
  totalBookings: number;
  totalRevenue: number;
  monthlyStats: MonthlyStats[];
}

export interface MonthlyStats {
  month: string;
  bookings: number;
  revenue: number;
}