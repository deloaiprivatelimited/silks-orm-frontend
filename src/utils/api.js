import axios from "axios";

const BASE_URL =  "https://silks-orm-bakcend.onrender.com/";

const api = axios.create({ baseURL: BASE_URL });

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;

// ── Auth ─────────────────────────────────────────────────────────────────────
export const login = (email, password) =>
  api.post("/api/auth/login", { email, password });

// ── Clients ──────────────────────────────────────────────────────────────────
export const getClients = (search = "") =>
  api.get("/api/clients", { params: search ? { search } : {} });
export const getClient = (id) => api.get(`/api/clients/${id}`);
export const createClient = (data) => api.post("/api/clients", data);
export const updateClient = (id, data) => api.put(`/api/clients/${id}`, data);
export const deleteClient = (id) => api.delete(`/api/clients/${id}`);

// ── Vendors ──────────────────────────────────────────────────────────────────
export const getVendors = (process_type = "") =>
  api.get("/api/vendors", { params: process_type ? { process_type } : {} });
export const createVendor = (data) => api.post("/api/vendors", data);
export const updateVendor = (id, data) => api.put(`/api/vendors/${id}`, data);
export const deleteVendor = (id) => api.delete(`/api/vendors/${id}`);

// ── Orders ───────────────────────────────────────────────────────────────────
export const getOrders = (params = {}) => api.get("/api/orders", { params });
export const getOrder = (id) => api.get(`/api/orders/${id}`);
export const createOrder = (data) => api.post("/api/orders", data);
export const updateOrderStatus = (id, status) =>
  api.patch(`/api/orders/${id}/status`, { status });
export const sendToProcess = (id, step, data) =>
  api.post(`/api/orders/${id}/process/${step}/send`, data);
export const completeProcessStep = (id, step, dispatch_id) =>
  api.patch(`/api/orders/${id}/process/${step}/complete/${dispatch_id}`)
export const completeOrder = (id, data) =>
  api.patch(`/api/orders/${id}/complete`, data);