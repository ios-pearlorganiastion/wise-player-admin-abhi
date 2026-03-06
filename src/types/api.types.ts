// Authentication Types
export interface LoginRequest {
  username: string;
  password?: string; // Optional if we consider they might use email/username interchangeably, but based on docs it's username+password
}

export interface LoginResponse {
  token: string;
  username: string;
  fullName: string;
  role: "ADMIN" | "SUPER_ADMIN";
}

export interface SetupRequest {
  username: string;
  password?: string;
  fullName: string;
  role: "ADMIN" | "USER"; 
}

// Pagination Base Types
export interface PaginatedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  empty: boolean;
}

// Dashboard Types
export interface DashboardStats {
  totalDevices: number;
  activeDevices: number;
  blockedDevices: number;
  totalRevenue: number;
  activeSubscriptions: number;
  // Note: Add precise fields based on actual API payload, using generic placeholders if needed
  [key: string]: number | string | boolean | undefined; 
}

// Device Types
export interface Device {
  id: string; // uuid
  macAddress: string;
  status: "ACTIVE" | "BLOCKED" | "INACTIVE";
  lastActiveAt?: string;
  deviceModel?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UpdateDeviceStatusRequest {
  status: "ACTIVE" | "BLOCKED";
}

// Payment Types
export interface Payment {
  id: string; // uuid
  amount: number;
  currency: string;
  paymentMethod: string;
  status: "COMPLETED" | "PENDING" | "FAILED" | "REFUNDED";
  transactionId?: string;
  createdAt: string;
}

export interface PaymentStats {
  totalRevenue: number;
  monthlyRevenue: number;
  transactionsCount: number;
}

// Subscription Types
export interface Subscription {
  id: string; // uuid
  deviceId: string;
  plan: "ANNUAL" | "MONTHLY" | "LIFETIME";
  status: "ACTIVE" | "EXPIRED" | "CANCELLED";
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface ManualSubscriptionRequest {
  deviceId: string;
  plan: "ANNUAL" | "MONTHLY";
}
