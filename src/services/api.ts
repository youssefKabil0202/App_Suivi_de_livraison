import axios from "axios";

// Create Axios Instance targeting local API
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor to dynamically inject Bearer JWT from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("campus_delivery_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor to clear storage on auth failures
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("campus_delivery_token");
      localStorage.removeItem("campus_delivery_user");
      // Optionally redirect if window resides outside iframe
    }
    return Promise.reject(error);
  }
);

export default api;

// Authentication APIs
export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    if (response.data.success && response.data.data) {
      localStorage.setItem("campus_delivery_token", response.data.data.token);
      localStorage.setItem("campus_delivery_user", JSON.stringify(response.data.data));
    }
    return response.data;
  },

  register: async (name: string, email: string, role: string) => {
    const response = await api.post("/auth/register", { name, email, password: "password123", role });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("campus_delivery_token");
    localStorage.removeItem("campus_delivery_user");
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem("campus_delivery_user");
    return userStr ? JSON.parse(userStr) : null;
  },

  updateProfile: async (name: string, email: string, password?: string) => {
    const response = await api.put("/auth/profile", { name, email, password });
    if (response.data.success && response.data.data) {
      localStorage.setItem("campus_delivery_token", response.data.data.token);
      localStorage.setItem("campus_delivery_user", JSON.stringify(response.data.data));
    }
    return response.data;
  },
};

// Administrator Dashboard & Stats
export const adminService = {
  getStats: async () => {
    const response = await api.get("/admin/dashboard/stats");
    return response.data;
  },

  getDeliveries: async () => {
    const response = await api.get("/admin/deliveries");
    return response.data;
  },

  assignCourier: async (deliveryId: number, courierId: number) => {
    const response = await api.put(`/admin/deliveries/${deliveryId}/assign`, { courierId });
    return response.data;
  },

  cancelDelivery: async (deliveryId: number) => {
    const response = await api.put(`/admin/deliveries/${deliveryId}/cancel`);
    return response.data;
  },

  getUsers: async () => {
    const response = await api.get("/admin/users");
    return response.data;
  },

  updateUserRole: async (userId: number, role: string) => {
    const response = await api.put(`/admin/users/${userId}/role?role=${role}`);
    return response.data;
  },

  updateUser: async (userId: number, userData: { name: string; email: string; role: string; isActive: boolean }) => {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data;
  },

  deleteUser: async (userId: number) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  getAddresses: async () => {
    const response = await api.get("/admin/addresses");
    return response.data;
  },

  createAddress: async (addressData: { label: string; addressLine: string; latitude: number; longitude: number; isFrequent: boolean; userId?: number }) => {
    const response = await api.post("/admin/addresses", addressData);
    return response.data;
  },

  updateAddress: async (addressId: number, addressData: { label: string; addressLine: string; latitude: number; longitude: number; isFrequent: boolean; userId?: number | null }) => {
    const response = await api.put(`/admin/addresses/${addressId}`, addressData);
    return response.data;
  },

  deleteAddress: async (addressId: number) => {
    const response = await api.delete(`/admin/addresses/${addressId}`);
    return response.data;
  },
};

// Client APIs
export const clientService = {
  createDelivery: async (pickupAddressId: number, dropoffAddressId: number) => {
    const response = await api.post("/client/deliveries", { pickupAddressId, dropoffAddressId });
    return response.data;
  },

  getHistory: async () => {
    const response = await api.get("/client/deliveries");
    return response.data;
  },

  getStatus: async (deliveryId: number) => {
    const response = await api.get(`/client/deliveries/${deliveryId}/status`);
    return response.data;
  },

  getLogs: async (deliveryId: number) => {
    const response = await api.get(`/client/deliveries/${deliveryId}/logs`);
    return response.data;
  },
};

// Courier APIs
export const courierService = {
  getMyDeliveries: async () => {
    const response = await api.get("/courier/deliveries");
    return response.data;
  },

  updateStatus: async (deliveryId: number, status: string, notes?: string) => {
    const response = await api.put(`/courier/deliveries/${deliveryId}/status`, { status, notes });
    return response.data;
  },
};

// Shared Delivery APIs
export const deliveryService = {
  getDetails: async (deliveryId: number) => {
    const response = await api.get(`/deliveries/${deliveryId}`);
    return response.data;
  },

  getLogs: async (deliveryId: number) => {
    const response = await api.get(`/client/deliveries/${deliveryId}/logs`);
    return response.data;
  },
};

