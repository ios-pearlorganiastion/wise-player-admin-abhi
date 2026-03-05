// Authentication Endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: "/api/admin/auth/login",
  SETUP: "/api/admin/auth/setup",
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
};

// Payments Endpoints
export const PAYMENTS_ENDPOINTS = {
  LIST: "/api/admin/payments", // Append ?page=n&size=n
  STATS: "/api/admin/payments/stats",
};

// Subscriptions Endpoints
export const SUBSCRIPTIONS_ENDPOINTS = {
  LIST: "/api/admin/subscriptions", // Append ?page=n&size=n
  MANUAL: "/api/admin/subscriptions/manual",
  DELETE: (subscriptionId: string) => `/api/admin/subscriptions/${subscriptionId}`,
};
