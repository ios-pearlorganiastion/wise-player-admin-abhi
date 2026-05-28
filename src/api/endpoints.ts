// Authentication Endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: "/api/admin/auth/login",
  INVITE: "/api/admin/management/invite",
  VERIFY_INVITE: "/api/admin/management/invite/verify",
  COMPLETE_SETUP: "/api/admin/management/setup/complete",
  CHANGE_PASSWORD: "/api/admin/auth/change-password",
  FORGOT_PASSWORD: "/api/admin/auth/forgot-password",
  RESET_PASSWORD: "/api/admin/auth/reset-password",
};

// Dashboard Endpoints
export const DASHBOARD_ENDPOINTS = {
  STATS: "/api/admin/dashboard/stats",
};

// Devices Endpoints
export const DEVICES_ENDPOINTS = {
  LIST: "/api/admin/devices", // Append ?page=n&size=n
  GET_BY_ID: (deviceId: string) => `/api/admin/devices/${deviceId}`,
  UPDATE_STATUS: (deviceId: string) => `/api/admin/devices/${deviceId}/status`,
  DELETE: (deviceId: string) => `/api/admin/devices/${deviceId}`,
};

// Payments Endpoints
export const PAYMENTS_ENDPOINTS = {
  LIST: "/api/admin/payments", // Append ?page=n&size=n
  STATS: "/api/admin/payments/stats",
};

// Subscriptions Endpoints
export const SUBSCRIPTIONS_ENDPOINTS = {
  LIST: "/api/admin/subscriptions",
  MANUAL: "/api/admin/subscriptions/manual",
  DELETE: (subscriptionId: string) => `/api/admin/subscriptions/${subscriptionId}`,
};

// Reseller Management
export const RESELLER_ENDPOINTS = {
  LIST: "/api/admin/resellers",
  GET_BY_ID: (id: string) => `/api/admin/resellers/${id}`,
  GET_STATS: (id: string) => `/api/admin/resellers/${id}/stats`,
  GET_ANALYTICS: (id: string) => `/api/admin/resellers/${id}/analytics`,
  GET_SUB_RESELLERS: (id: string) => `/api/admin/resellers/${id}/sub-resellers`,
  TOGGLE_STATUS: (id: string) => `/api/admin/resellers/${id}/status`,
  CREATE: "/api/reseller/register",
  UPDATE: (id: string) => `/api/admin/resellers/${id}`,
};

// Plan Management
export const PLAN_ENDPOINTS = {
  CREATE: "/api/admin/plans",
  LIST_ALL: "/api/admin/plans",
  LIST_ACTIVE: "/api/admin/plans/active",
  UPDATE: (id: string) => `/api/admin/plans/${id}`,
  TOGGLE_STATUS: (id: string) => `/api/admin/plans/${id}/status`,
};

// Activation Requests
export const ACTIVATION_ENDPOINTS = {
  LIST: "/api/admin/activation-requests",
  GET_BY_ID: (id: string) => `/api/admin/activation-requests/${id}`,
  APPROVE: (id: string) => `/api/admin/activation-requests/${id}/approve`,
  REJECT: (id: string) => `/api/admin/activation-requests/${id}/reject`,
};

// Reports
export const REPORT_ENDPOINTS = {
  REVENUE: "/api/admin/reports/revenue",
  DEVICES: "/api/admin/reports/devices",
  SUBSCRIPTIONS: "/api/admin/reports/subscriptions",
  RESELLERS: "/api/admin/reports/resellers",
};

// Support Ticket Management
export const SUPPORT_TICKETS_ENDPOINTS = {
  LIST: "/api/admin/support/tickets", // ?status=OPEN&page=0&size=10
  GET_BY_ID: (id: string) => `/api/admin/support/tickets/${id}`,
  UPDATE_STATUS: (id: string) => `/api/admin/support/tickets/${id}/status`,
};
