const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const AUTH_STORAGE_KEY = "chopin-delivery-auth";

export function readAuthSession() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeAuthSession(session) {
  if (typeof window === "undefined") return;
  if (!session) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function getAuthToken() {
  return readAuthSession()?.token || null;
}

function buildUrl(path, query) {
  const cleanBase = API_BASE_URL.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${cleanBase}${normalizedPath}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      url.searchParams.set(key, String(value));
    });
  }

  return url.toString();
}

export async function apiRequest(path, options = {}) {
  const {
    method = "GET",
    body,
    token,
    query,
    headers = {},
    expectJson = true,
  } = options;

  const url = buildUrl(path, query);
  const requestHeaders = { ...headers };

  if (!(body instanceof FormData)) {
    requestHeaders["Content-Type"] = "application/json";
  }

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: body && !(body instanceof FormData) ? JSON.stringify(body) : body,
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof payload === "object" && payload ? payload.message || "Request failed" : payload || "Request failed";
    throw new Error(message);
  }

  if (!expectJson) {
    return payload;
  }

  return payload && typeof payload === "object" ? payload : { data: payload };
}

export const authApi = {
  register: ({ name, email, password }) => apiRequest("/auth/register", {
    method: "POST",
    body: { name, email, password },
  }),
  login: ({ email, password }) => apiRequest("/auth/login", {
    method: "POST",
    body: { email, password },
  }),
  me: (token) => apiRequest("/auth/me", { token }),
};

export const userApi = {
  me: (token) => apiRequest("/users/me", { token }),
};

export const deliveryApi = {
  list: (token, query = {}) => apiRequest("/deliveries", { token, query }),
  create: (token, payload) => apiRequest("/deliveries", { method: "POST", token, body: payload }),
  get: (token, id) => apiRequest(`/deliveries/${id}`, { token }),
  update: (token, id, payload) => apiRequest(`/deliveries/${id}`, { method: "PATCH", token, body: payload }),
  cancel: (token, id) => apiRequest(`/deliveries/${id}/cancel`, { method: "PATCH", token }),
  adminList: (token, query = {}) => apiRequest("/admin/deliveries", { token, query }),
  adminStatus: (token, id, status) => apiRequest(`/admin/deliveries/${id}/status`, { method: "PATCH", token, body: { status } }),
  assignRider: (token, id, riderId) => apiRequest(`/admin/deliveries/${id}/assign`, { method: "PATCH", token, body: { riderId } }),
};

export const paymentApi = {
  list: (token, query = {}) => apiRequest("/payments", { token, query }),
  create: (token, payload) => apiRequest("/payments", { method: "POST", token, body: payload }),
  get: (token, id) => apiRequest(`/payments/${id}`, { token }),
  updateStatus: (token, id, status) => apiRequest(`/payments/${id}/status`, { method: "PATCH", token, body: { status } }),
};

export const riderApi = {
  me: (token) => apiRequest("/riders/me", { token }),
  updateAvailability: (token, availability) => apiRequest("/riders/availability", {
    method: "PATCH",
    token,
    body: { availability },
  }),
  listAvailable: (token) => apiRequest("/riders/deliveries/available", { token }),
  accept: (token, id) => apiRequest(`/riders/deliveries/${id}/accept`, { method: "POST", token }),
  listAssignments: (token) => apiRequest("/riders/deliveries", { token }),
  updateStatus: (token, id, status) => apiRequest(`/riders/deliveries/${id}/status`, { method: "PATCH", token, body: { status } }),
};

export const adminApi = {
  listUsers: (token, query = {}) => apiRequest("/admin/users", { token, query }),
  updateUserStatus: (token, id, status) => apiRequest(`/admin/users/${id}/status`, { method: "PATCH", token, body: { status } }),
  listRiders: (token, query = {}) => apiRequest("/admin/riders", { token, query }),
  createRider: (token, payload) => apiRequest("/admin/riders", { method: "POST", token, body: payload }),
  listPayments: (token) => apiRequest("/admin/payments", { token }),
};
