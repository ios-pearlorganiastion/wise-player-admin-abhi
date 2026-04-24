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
  pendingActivations?: number;
  openSupportTickets?: number;
  // Note: Add precise fields based on actual API payload, using generic placeholders if needed
  [key: string]: number | string | boolean | undefined; 
}

// Device Types
export interface Device {
  deviceId: string;
  deviceStatus: "ACTIVE" | "BLOCKED" | "INACTIVE";
  subscriptionType: string;
  deviceModel: string;
  osVersion: string;
  platform: string;
  registeredAt: string;
  lastSeenAt: string;
  expiresAt: string;
  // Legacy fields for compatibility
  id?: string;
  macAddress?: string;
  status?: string;
  createdAt?: string;
}

export interface UpdateDeviceStatusRequest {
  status: "ACTIVE" | "BLOCKED";
}

// Payment Types
export interface Payment {
  id: string; // uuid
  paymentId: string;
  deviceId: string;
  amount: number;
  currency: string;
  plan?: string;
  planName?: string;
  subscriptionPlan?: string;
  paymentMethod: string;
  paypalOrderId?: string;
  status: "SUCCESS" | "COMPLETED" | "PENDING" | "FAILED" | "REFUNDED";
  transactionId?: string;
  createdAt: string;
}

export interface PaymentStats {
  totalTransactions: number;
  successfulTransactions: number;
  totalRevenue: number;
  monthlyRevenue?: number;
  transactionsCount?: number;
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

// Reseller Types
export interface Reseller {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
  totalUsers: number;
}

export interface ResellerCreateRequest {
  username: string;
  password: string;
  fullName: string;
  email?: string;
}

export interface ResellerUpdateRequest {
  fullName?: string;
  email?: string;
  password?: string;
}

export interface ResellerAnalytics {
  date: string;
  activations: number;
  revenue: number;
}

export interface SubReseller {
  id: string;
  username: string;
  fullName: string;
  activeUsers: number;
  status: string;
  joinedAt: string;
}

// Plan Types
export interface Plan {
  id: string;
  name: string;
  durationDays: number;
  price: number;
  currency: string;
  description: string;
  status: "ACTIVE" | "INACTIVE";
}

// Activation Request Types
export interface ActivationRequest {
  id: string;
  deviceId: string;
  planId: string;
  planName: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  adminNotes?: string;
  createdAt: string;
  amount: number;
  currency: string;
}

// Report Types
export interface RevenueReport {
  totalRevenue: number;
  successfulPayments: number;
  failedPayments: number;
}

export interface DeviceReport {
  newDevices: number;
}

export interface SubscriptionReport {
  newSubscriptions: number;
}

export interface ResellerReport {
  id: string;
  fullName: string;
  username: string;
  role: string;
  totalUsers: number;
  activeUsers: number;
  pendingRequests: number;
}

// Support Ticket Types
export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export interface SupportTicket {
  id: string; // UUID
  firstName: string;
  lastName: string;
  email: string;
  macAddress: string;
  inquiryType: string;
  message: string;
  attachmentUrl?: string;
  status: TicketStatus;
  createdAt: string;
}

export interface UpdateTicketStatusRequest {
  status: TicketStatus;
}
