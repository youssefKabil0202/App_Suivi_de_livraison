export interface User {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "CLIENT" | "COURIER";
  isActive?: boolean;
  createdAt?: string;
}

export interface Address {
  id: number;
  userId: number | null;
  userName?: string;
  label: string;
  addressLine: string;
  latitude: number;
  longitude: number;
  isFrequent: boolean;
}

export interface Delivery {
  id: number;
  clientId: number;
  client: User;
  courierId: number | null;
  courier: User | null;
  pickupAddressId: number;
  pickupAddress: Address;
  dropoffAddressId: number;
  dropoffAddress: Address;
  status: "CREATED" | "PICKED_UP" | "EN_ROUTE" | "DELIVERED" | "CANCELED";
  createdAt: string;
  updatedAt: string;
}

export interface StatusLog {
  id: number;
  deliveryId: number;
  status: "CREATED" | "PICKED_UP" | "EN_ROUTE" | "DELIVERED" | "CANCELED";
  changedBy: User;
  changedAt: string;
  notes: string;
}

export interface DashboardStats {
  totalToday: number;
  pendingCount: number;
  completedCount: number;
  canceledCount: number;
  avgDeliveryTimeMinutes: number;
}
