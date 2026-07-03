import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

// Define Interfaces for In-Memory DB
interface User {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  role: "ADMIN" | "CLIENT" | "COURIER";
  isActive?: boolean;
  createdAt: string;
}

interface Address {
  id: number;
  userId: number | null;
  userName?: string;
  label: string;
  addressLine: string;
  latitude: number;
  longitude: number;
  isFrequent: boolean;
}

interface Delivery {
  id: number;
  clientId: number;
  client: { id: number; name: string; email: string; role: string };
  courierId: number | null;
  courier: { id: number; name: string; email: string; role: string } | null;
  pickupAddressId: number;
  pickupAddress: Address;
  dropoffAddressId: number;
  dropoffAddress: Address;
  status: "CREATED" | "PICKED_UP" | "EN_ROUTE" | "DELIVERED" | "CANCELED";
  createdAt: string;
  updatedAt: string;
}

interface StatusLog {
  id: number;
  deliveryId: number;
  status: "CREATED" | "PICKED_UP" | "EN_ROUTE" | "DELIVERED" | "CANCELED";
  changedBy: { id: number; name: string; email: string; role: string };
  changedAt: string;
  notes: string;
}

// Global In-Memory Database
const users: User[] = [
  { id: 1, name: "Admin Oussama", email: "admin@campusdelivery.com", passwordHash: "password123", role: "ADMIN", isActive: true, createdAt: new Date(Date.now() - 10 * 86400000).toISOString() },
  { id: 2, name: "Client Youssef", email: "client.youssef@gmail.com", passwordHash: "password123", role: "CLIENT", isActive: true, createdAt: new Date(Date.now() - 9 * 86400000).toISOString() },
  { id: 3, name: "Client Sarah", email: "client.sarah@gmail.com", passwordHash: "password123", role: "CLIENT", isActive: true, createdAt: new Date(Date.now() - 8 * 86400000).toISOString() },
  { id: 4, name: "Courier Ahmed", email: "courier.ahmed@campusdelivery.com", passwordHash: "password123", role: "COURIER", isActive: true, createdAt: new Date(Date.now() - 7 * 86400000).toISOString() },
  { id: 5, name: "Courier Fatima", email: "courier.fatima@campusdelivery.com", passwordHash: "password123", role: "COURIER", isActive: true, createdAt: new Date(Date.now() - 6 * 86400000).toISOString() },
];

const addresses: Address[] = [
  { id: 1, userId: null, label: "Science Block Library", addressLine: "Central Campus, Science Building, Gate 2", latitude: 33.5731, longitude: -7.5898, isFrequent: true },
  { id: 2, userId: null, label: "Main Student Residence", addressLine: "Block C, Room 104, Campus Housing", latitude: 33.5722, longitude: -7.5912, isFrequent: true },
  { id: 3, userId: null, label: "University Cafeteria", addressLine: "East Wing, Food Court Area", latitude: 33.5745, longitude: -7.5872, isFrequent: true },
  { id: 4, userId: 2, userName: "Client Youssef", label: "Youssef's Dormitory", addressLine: "Block A, Room 302, Student Housing", latitude: 33.5715, longitude: -7.5930, isFrequent: false },
  { id: 5, userId: 3, userName: "Client Sarah", label: "Sarah's Department Office", addressLine: "Engineering Building, Floor 2, Room 205", latitude: 33.5750, longitude: -7.5850, isFrequent: false },
];

let deliveries: Delivery[] = [
  {
    id: 1, clientId: 2, client: { id: 2, name: "Client Youssef", email: "client.youssef@gmail.com", role: "CLIENT" },
    courierId: 4, courier: { id: 4, name: "Courier Ahmed", email: "courier.ahmed@campusdelivery.com", role: "COURIER" },
    pickupAddressId: 3, pickupAddress: addresses[2], dropoffAddressId: 4, dropoffAddress: addresses[3],
    status: "DELIVERED", createdAt: new Date(Date.now() - 3 * 86400000).toISOString(), updatedAt: new Date(Date.now() - 3 * 86400000 + 1800000).toISOString()
  },
  {
    id: 2, clientId: 3, client: { id: 3, name: "Client Sarah", email: "client.sarah@gmail.com", role: "CLIENT" },
    courierId: 5, courier: { id: 5, name: "Courier Fatima", email: "courier.fatima@campusdelivery.com", role: "COURIER" },
    pickupAddressId: 1, pickupAddress: addresses[0], dropoffAddressId: 5, dropoffAddress: addresses[4],
    status: "DELIVERED", createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), updatedAt: new Date(Date.now() - 2 * 86400000 + 2700000).toISOString()
  },
  {
    id: 3, clientId: 2, client: { id: 2, name: "Client Youssef", email: "client.youssef@gmail.com", role: "CLIENT" },
    courierId: 4, courier: { id: 4, name: "Courier Ahmed", email: "courier.ahmed@campusdelivery.com", role: "COURIER" },
    pickupAddressId: 1, pickupAddress: addresses[0], dropoffAddressId: 2, dropoffAddress: addresses[1],
    status: "DELIVERED", createdAt: new Date(Date.now() - 1 * 86400000).toISOString(), updatedAt: new Date(Date.now() - 1 * 86400000 + 1500000).toISOString()
  },
  {
    id: 4, clientId: 3, client: { id: 3, name: "Client Sarah", email: "client.sarah@gmail.com", role: "CLIENT" },
    courierId: null, courier: null,
    pickupAddressId: 3, pickupAddress: addresses[2], dropoffAddressId: 2, dropoffAddress: addresses[1],
    status: "CREATED", createdAt: new Date(Date.now() - 4 * 3600000).toISOString(), updatedAt: new Date(Date.now() - 4 * 3600000).toISOString()
  },
  {
    id: 5, clientId: 2, client: { id: 2, name: "Client Youssef", email: "client.youssef@gmail.com", role: "CLIENT" },
    courierId: 4, courier: { id: 4, name: "Courier Ahmed", email: "courier.ahmed@campusdelivery.com", role: "COURIER" },
    pickupAddressId: 2, pickupAddress: addresses[1], dropoffAddressId: 1, dropoffAddress: addresses[0],
    status: "PICKED_UP", createdAt: new Date(Date.now() - 3 * 3600000).toISOString(), updatedAt: new Date(Date.now() - 1 * 3600000).toISOString()
  },
  {
    id: 6, clientId: 3, client: { id: 3, name: "Client Sarah", email: "client.sarah@gmail.com", role: "CLIENT" },
    courierId: 5, courier: { id: 5, name: "Courier Fatima", email: "courier.fatima@campusdelivery.com", role: "COURIER" },
    pickupAddressId: 3, pickupAddress: addresses[2], dropoffAddressId: 5, dropoffAddress: addresses[4],
    status: "EN_ROUTE", createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), updatedAt: new Date(Date.now() - 30 * 60000).toISOString()
  },
  {
    id: 7, clientId: 2, client: { id: 2, name: "Client Youssef", email: "client.youssef@gmail.com", role: "CLIENT" },
    courierId: 4, courier: { id: 4, name: "Courier Ahmed", email: "courier.ahmed@campusdelivery.com", role: "COURIER" },
    pickupAddressId: 1, pickupAddress: addresses[0], dropoffAddressId: 4, dropoffAddress: addresses[3],
    status: "DELIVERED", createdAt: new Date(Date.now() - 5 * 3600000).toISOString(), updatedAt: new Date(Date.now() - 4 * 3600000).toISOString()
  },
  {
    id: 8, clientId: 3, client: { id: 3, name: "Client Sarah", email: "client.sarah@gmail.com", role: "CLIENT" },
    courierId: 5, courier: { id: 5, name: "Courier Fatima", email: "courier.fatima@campusdelivery.com", role: "COURIER" },
    pickupAddressId: 2, pickupAddress: addresses[1], dropoffAddressId: 5, dropoffAddress: addresses[4],
    status: "CANCELED", createdAt: new Date(Date.now() - 6 * 3600000).toISOString(), updatedAt: new Date(Date.now() - 5 * 3600000).toISOString()
  },
  {
    id: 9, clientId: 2, client: { id: 2, name: "Client Youssef", email: "client.youssef@gmail.com", role: "CLIENT" },
    courierId: null, courier: null,
    pickupAddressId: 1, pickupAddress: addresses[0], dropoffAddressId: 3, dropoffAddress: addresses[2],
    status: "CREATED", createdAt: new Date(Date.now() - 30 * 60000).toISOString(), updatedAt: new Date(Date.now() - 30 * 60000).toISOString()
  },
  {
    id: 10, clientId: 3, client: { id: 3, name: "Client Sarah", email: "client.sarah@gmail.com", role: "CLIENT" },
    courierId: 4, courier: { id: 4, name: "Courier Ahmed", email: "courier.ahmed@campusdelivery.com", role: "COURIER" },
    pickupAddressId: 3, pickupAddress: addresses[2], dropoffAddressId: 1, dropoffAddress: addresses[0],
    status: "EN_ROUTE", createdAt: new Date(Date.now() - 1 * 3600000).toISOString(), updatedAt: new Date(Date.now() - 15 * 60000).toISOString()
  },
];

const statusLogs: StatusLog[] = [
  { id: 1, deliveryId: 1, status: "CREATED", changedBy: { id: 2, name: "Client Youssef", email: "client.youssef@gmail.com", role: "CLIENT" }, changedAt: new Date(Date.now() - 3 * 86400000).toISOString(), notes: "Delivery requested for warm meal." },
  { id: 2, deliveryId: 1, status: "PICKED_UP", changedBy: { id: 4, name: "Courier Ahmed", email: "courier.ahmed@campusdelivery.com", role: "COURIER" }, changedAt: new Date(Date.now() - 3 * 86400000 + 600000).toISOString(), notes: "Courier Ahmed picked up the meal from Cafeteria." },
  { id: 3, deliveryId: 1, status: "EN_ROUTE", changedBy: { id: 4, name: "Courier Ahmed", email: "courier.ahmed@campusdelivery.com", role: "COURIER" }, changedAt: new Date(Date.now() - 3 * 86400000 + 900000).toISOString(), notes: "En route to dorm." },
  { id: 4, deliveryId: 1, status: "DELIVERED", changedBy: { id: 4, name: "Courier Ahmed", email: "courier.ahmed@campusdelivery.com", role: "COURIER" }, changedAt: new Date(Date.now() - 3 * 86400000 + 1800000).toISOString(), notes: "Delivered to room. Client signed." },

  { id: 5, deliveryId: 2, status: "CREATED", changedBy: { id: 3, name: "Client Sarah", email: "client.sarah@gmail.com", role: "CLIENT" }, changedAt: new Date(Date.now() - 2 * 86400000).toISOString(), notes: "Requested urgent document drop-off." },
  { id: 6, deliveryId: 2, status: "PICKED_UP", changedBy: { id: 5, name: "Courier Fatima", email: "courier.fatima@campusdelivery.com", role: "COURIER" }, changedAt: new Date(Date.now() - 2 * 86400000 + 900000).toISOString(), notes: "Courier Fatima picked up textbooks." },
  { id: 7, deliveryId: 2, status: "EN_ROUTE", changedBy: { id: 5, name: "Courier Fatima", email: "courier.fatima@campusdelivery.com", role: "COURIER" }, changedAt: new Date(Date.now() - 2 * 86400000 + 1200000).toISOString(), notes: "En route to Engineering Dept." },
  { id: 8, deliveryId: 2, status: "DELIVERED", changedBy: { id: 5, name: "Courier Fatima", email: "courier.fatima@campusdelivery.com", role: "COURIER" }, changedAt: new Date(Date.now() - 2 * 86400000 + 2700000).toISOString(), notes: "Left at secretary office as requested." },

  { id: 9, deliveryId: 3, status: "CREATED", changedBy: { id: 2, name: "Client Youssef", email: "client.youssef@gmail.com", role: "CLIENT" }, changedAt: new Date(Date.now() - 1 * 86400000).toISOString(), notes: "Returning borrowed books to Library." },
  { id: 10, deliveryId: 3, status: "PICKED_UP", changedBy: { id: 4, name: "Courier Ahmed", email: "courier.ahmed@campusdelivery.com", role: "COURIER" }, changedAt: new Date(Date.now() - 1 * 86400000 + 300000).toISOString(), notes: "Picked up from student residence." },
  { id: 11, deliveryId: 3, status: "DELIVERED", changedBy: { id: 4, name: "Courier Ahmed", email: "courier.ahmed@campusdelivery.com", role: "COURIER" }, changedAt: new Date(Date.now() - 1 * 86400000 + 1500000).toISOString(), notes: "Returned to library desk." },

  { id: 12, deliveryId: 4, status: "CREATED", changedBy: { id: 3, name: "Client Sarah", email: "client.sarah@gmail.com", role: "CLIENT" }, changedAt: new Date(Date.now() - 4 * 3600000).toISOString(), notes: "Order for lunch delivery from Cafeteria." },

  { id: 13, deliveryId: 5, status: "CREATED", changedBy: { id: 2, name: "Client Youssef", email: "client.youssef@gmail.com", role: "CLIENT" }, changedAt: new Date(Date.now() - 3 * 3600000).toISOString(), notes: "Courier requested to bring coat from dorm." },
  { id: 14, deliveryId: 5, status: "PICKED_UP", changedBy: { id: 4, name: "Courier Ahmed", email: "courier.ahmed@campusdelivery.com", role: "COURIER" }, changedAt: new Date(Date.now() - 1 * 3600000).toISOString(), notes: "Picked up coat. Starting delivery soon." },

  { id: 15, deliveryId: 6, status: "CREATED", changedBy: { id: 3, name: "Client Sarah", email: "client.sarah@gmail.com", role: "CLIENT" }, changedAt: new Date(Date.now() - 2 * 3600000).toISOString(), notes: "Requested snack delivery." },
  { id: 16, deliveryId: 6, status: "PICKED_UP", changedBy: { id: 5, name: "Courier Fatima", email: "courier.fatima@campusdelivery.com", role: "COURIER" }, changedAt: new Date(Date.now() - 1 * 3600000).toISOString(), notes: "Picked up from cafeteria." },
  { id: 17, deliveryId: 6, status: "EN_ROUTE", changedBy: { id: 5, name: "Courier Fatima", email: "courier.fatima@campusdelivery.com", role: "COURIER" }, changedAt: new Date(Date.now() - 30 * 60000).toISOString(), notes: "Cycling to office block." },

  { id: 18, deliveryId: 7, status: "CREATED", changedBy: { id: 2, name: "Client Youssef", email: "client.youssef@gmail.com", role: "CLIENT" }, changedAt: new Date(Date.now() - 5 * 3600000).toISOString(), notes: "Lab report delivery to Science Block." },
  { id: 19, deliveryId: 7, status: "PICKED_UP", changedBy: { id: 4, name: "Courier Ahmed", email: "courier.ahmed@campusdelivery.com", role: "COURIER" }, changedAt: new Date(Date.now() - 4 * 3600000 - 2400000).toISOString(), notes: "Picked up from client." },
  { id: 20, deliveryId: 7, status: "DELIVERED", changedBy: { id: 4, name: "Courier Ahmed", email: "courier.ahmed@campusdelivery.com", role: "COURIER" }, changedAt: new Date(Date.now() - 4 * 3600000).toISOString(), notes: "Slipped under door." },

  { id: 21, deliveryId: 8, status: "CREATED", changedBy: { id: 3, name: "Client Sarah", email: "client.sarah@gmail.com", role: "CLIENT" }, changedAt: new Date(Date.now() - 6 * 3600000).toISOString(), notes: "Forgot keys, need courier help." },
  { id: 22, deliveryId: 8, status: "CANCELED", changedBy: { id: 1, name: "Admin Oussama", email: "admin@campusdelivery.com", role: "ADMIN" }, changedAt: new Date(Date.now() - 5 * 3600000).toISOString(), notes: "Canceled by admin: client found keys." },

  { id: 23, deliveryId: 9, status: "CREATED", changedBy: { id: 2, name: "Client Youssef", email: "client.youssef@gmail.com", role: "CLIENT" }, changedAt: new Date(Date.now() - 30 * 60000).toISOString(), notes: "Library laptop return service request." },

  { id: 24, deliveryId: 10, status: "CREATED", changedBy: { id: 3, name: "Client Sarah", email: "client.sarah@gmail.com", role: "CLIENT" }, changedAt: new Date(Date.now() - 1 * 3600000).toISOString(), notes: "Requested printing service Delivery." },
  { id: 25, deliveryId: 10, status: "PICKED_UP", changedBy: { id: 4, name: "Courier Ahmed", email: "courier.ahmed@campusdelivery.com", role: "COURIER" }, changedAt: new Date(Date.now() - 40 * 60000).toISOString(), notes: "Printing done. Courier Ahmed heading to dropoff." },
  { id: 26, deliveryId: 10, status: "EN_ROUTE", changedBy: { id: 4, name: "Courier Ahmed", email: "courier.ahmed@campusdelivery.com", role: "COURIER" }, changedAt: new Date(Date.now() - 15 * 60000).toISOString(), notes: "Heading to Science Block." },
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // CORS Middleware (simple fallback)
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // JWT Helper for Express Mock - Simple token mock (email encoded in Base64 or simple token)
  const getUserFromToken = (req: Request): User | null => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
    const token = authHeader.substring(7);
    try {
      // Decode simulated token, which is just the email or a simple JSON string
      let email = "";
      if (token.startsWith("mock-token-")) {
        email = token.replace("mock-token-", "");
      } else {
        // Fallback or attempt to parse standard token
        const decoded = Buffer.from(token, "base64").toString("ascii");
        if (decoded.includes("@")) email = decoded;
      }
      return users.find((u) => u.email === email) || null;
    } catch {
      return null;
    }
  };

  // Auth Middleware
  const authMiddleware = (roles?: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const user = getUserFromToken(req);
      if (!user) {
        return res.status(401).json({ success: false, message: "Unauthorized token", data: null });
      }
      if (roles && !roles.includes(user.role)) {
        return res.status(403).json({ success: false, message: "Access Forbidden: Insufficient role", data: null });
      }
      (req as any).user = user;
      next();
    };
  };

  // --- PUBLIC ENDPOINTS ---
  app.get("/api/health", (req, res) => {
    res.json({
      success: true,
      message: "Campus Delivery API is healthy and operational.",
      data: {
        status: "UP",
        database: "CONNECTED (In-Memory)",
        version: "1.0.0-MockExpress"
      }
    });
  });

  // --- AUTH ENDPOINTS ---
  app.post("/api/auth/register", (req, res) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: "Missing required registration parameters", data: null });
    }
    if (users.find((u) => u.email === email)) {
      return res.status(400).json({ success: false, message: "Email address is already registered.", data: null });
    }

    const newUser: User = {
      id: users.length + 1,
      name,
      email,
      passwordHash: "password123", // Simulated
      role: role.toUpperCase() as "ADMIN" | "CLIENT" | "COURIER",
      isActive: true,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);

    res.json({
      success: true,
      message: "User registered successfully.",
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isActive: newUser.isActive,
        createdAt: newUser.createdAt
      }
    });
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = users.find((u) => u.email === email);
    if (!user || password !== "password123") {
      return res.status(401).json({ success: false, message: "Invalid email or password (use password123).", data: null });
    }

    if (user.isActive === false) {
      return res.status(403).json({ success: false, message: "Your account is inactive/blocked. Please contact administrator.", data: null });
    }

    // Generate mock token: "mock-token-<email>"
    const token = "mock-token-" + user.email;

    res.json({
      success: true,
      message: "Login successful.",
      data: {
        token,
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  });

  app.put("/api/auth/profile", authMiddleware(["ADMIN", "CLIENT", "COURIER"]), (req, res) => {
    const user = (req as any).user as User;
    const { name, email, password } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ success: false, message: "Name and email are required" });
    }
    
    const existingUser = users.find(u => u.email === email && u.id !== user.id);
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email is already registered by another user.", data: null });
    }
    
    const dbUser = users.find(u => u.id === user.id);
    if (dbUser) {
      dbUser.name = name;
      dbUser.email = email;
      if (password) {
        dbUser.passwordHash = password;
      }
      
      // Update deliveries cached information for real-time consistency
      deliveries.forEach(d => {
        if (d.clientId === user.id) {
          d.client.name = name;
          d.client.email = email;
        }
        if (d.courierId === user.id && d.courier) {
          d.courier.name = name;
          d.courier.email = email;
        }
      });
      
      // Update logs changedBy cache
      statusLogs.forEach(l => {
        if (l.changedBy.id === user.id) {
          l.changedBy.name = name;
          l.changedBy.email = email;
        }
      });

      const token = "mock-token-" + email;
      
      return res.json({
        success: true,
        message: "Profile updated successfully.",
        data: {
          token,
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role
        }
      });
    }
    
    res.status(404).json({ success: false, message: "User profile not found.", data: null });
  });

  // --- ADMIN ENDPOINTS ---
  app.get("/api/admin/dashboard/stats", authMiddleware(["ADMIN"]), (req, res) => {
    // Compile counts
    const todayStr = new Date().toDateString();
    const totalToday = deliveries.filter(d => new Date(d.createdAt).toDateString() === todayStr).length;
    const pendingCount = deliveries.filter(d => ["CREATED", "PICKED_UP", "EN_ROUTE"].includes(d.status)).length;
    const completedCount = deliveries.filter(d => d.status === "DELIVERED").length;
    const canceledCount = deliveries.filter(d => d.status === "CANCELED").length;

    // Calculate average duration in minutes for DELIVERED ones
    const delivered = deliveries.filter(d => d.status === "DELIVERED");
    let totalMinutes = 0;
    delivered.forEach(d => {
      const start = new Date(d.createdAt).getTime();
      const end = new Date(d.updatedAt).getTime();
      totalMinutes += Math.max(15, Math.round((end - start) / 60000));
    });
    const avgDeliveryTimeMinutes = delivered.length > 0 ? Number((totalMinutes / delivered.length).toFixed(1)) : 30.0;

    res.json({
      success: true,
      message: "Dashboard statistics retrieved successfully.",
      data: {
        totalToday,
        pendingCount,
        completedCount,
        canceledCount,
        avgDeliveryTimeMinutes
      }
    });
  });

  app.get("/api/admin/deliveries", authMiddleware(["ADMIN"]), (req, res) => {
    // Sort reverse chronological
    const sorted = [...deliveries].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({
      success: true,
      message: "Deliveries list retrieved.",
      data: sorted
    });
  });

  app.put("/api/admin/deliveries/:id/assign", authMiddleware(["ADMIN"]), (req, res) => {
    const deliveryId = parseInt(req.params.id);
    const { courierId } = req.body;
    const actor = (req as any).user as User;

    const delivery = deliveries.find(d => d.id === deliveryId);
    if (!delivery) {
      return res.status(404).json({ success: false, message: "Delivery not found.", data: null });
    }

    const courier = users.find(u => u.id === parseInt(courierId) && u.role === "COURIER");
    if (!courier) {
      return res.status(400).json({ success: false, message: "Invalid or non-existent courier.", data: null });
    }

    delivery.courierId = courier.id;
    delivery.courier = { id: courier.id, name: courier.name, email: courier.email, role: courier.role };
    delivery.updatedAt = new Date().toISOString();

    // Create log
    const newLog: StatusLog = {
      id: statusLogs.length + 1,
      deliveryId,
      status: delivery.status,
      changedBy: { id: actor.id, name: actor.name, email: actor.email, role: actor.role },
      changedAt: new Date().toISOString(),
      notes: `Courier manually assigned: ${courier.name}`
    };
    statusLogs.push(newLog);

    res.json({
      success: true,
      message: "Courier assigned successfully.",
      data: delivery
    });
  });

  app.put("/api/admin/deliveries/:id/cancel", authMiddleware(["ADMIN"]), (req, res) => {
    const deliveryId = parseInt(req.params.id);
    const actor = (req as any).user as User;

    const delivery = deliveries.find(d => d.id === deliveryId);
    if (!delivery) {
      return res.status(404).json({ success: false, message: "Delivery not found.", data: null });
    }

    if (delivery.status === "DELIVERED" || delivery.status === "CANCELED") {
      return res.status(400).json({ success: false, message: `Cannot cancel a delivery that is already ${delivery.status}`, data: null });
    }

    delivery.status = "CANCELED";
    delivery.updatedAt = new Date().toISOString();

    const newLog: StatusLog = {
      id: statusLogs.length + 1,
      deliveryId,
      status: "CANCELED",
      changedBy: { id: actor.id, name: actor.name, email: actor.email, role: actor.role },
      changedAt: new Date().toISOString(),
      notes: `Delivery canceled by ${actor.name}`
    };
    statusLogs.push(newLog);

    res.json({
      success: true,
      message: "Delivery canceled successfully.",
      data: delivery
    });
  });

  app.get("/api/admin/users", authMiddleware(["ADMIN"]), (req, res) => {
    const safeUsers = users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, isActive: u.isActive !== false, createdAt: u.createdAt }));
    res.json({
      success: true,
      message: "Users list retrieved.",
      data: safeUsers
    });
  });

  app.put("/api/admin/users/:id", authMiddleware(["ADMIN"]), (req, res) => {
    const userId = parseInt(req.params.id);
    const { name, email, role, isActive } = req.body;

    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found.", data: null });
    }

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (role !== undefined) {
      if (["ADMIN", "CLIENT", "COURIER"].includes(role.toUpperCase())) {
        user.role = role.toUpperCase() as "ADMIN" | "CLIENT" | "COURIER";
        // Cascade role update in deliveries list for simplicity
        deliveries.forEach(d => {
          if (d.clientId === userId) d.client.role = user.role;
          if (d.courierId === userId && d.courier) d.courier.role = user.role;
        });
      } else {
        return res.status(400).json({ success: false, message: "Invalid role specified.", data: null });
      }
    }
    if (isActive !== undefined) {
      user.isActive = isActive === true || isActive === "true";
    }

    res.json({
      success: true,
      message: "User updated successfully.",
      data: { id: user.id, name: user.name, email: user.email, role: user.role, isActive: user.isActive !== false, createdAt: user.createdAt }
    });
  });

  app.put("/api/admin/users/:id/role", authMiddleware(["ADMIN"]), (req, res) => {
    const userId = parseInt(req.params.id);
    const { role } = req.query;

    if (!role || !["ADMIN", "CLIENT", "COURIER"].includes((role as string).toUpperCase())) {
      return res.status(400).json({ success: false, message: "Invalid role specified.", data: null });
    }

    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found.", data: null });
    }

    user.role = (role as string).toUpperCase() as "ADMIN" | "CLIENT" | "COURIER";

    // Cascade role update in deliveries list for simplicity
    deliveries.forEach(d => {
      if (d.clientId === userId) d.client.role = user.role;
      if (d.courierId === userId && d.courier) d.courier.role = user.role;
    });

    res.json({
      success: true,
      message: "User role updated successfully.",
      data: { id: user.id, name: user.name, email: user.email, role: user.role, isActive: user.isActive !== false, createdAt: user.createdAt }
    });
  });

  app.delete("/api/admin/users/:id", authMiddleware(["ADMIN"]), (req, res) => {
    const userId = parseInt(req.params.id);
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) {
      return res.status(404).json({ success: false, message: "User not found.", data: null });
    }

    users.splice(index, 1);
    res.json({
      success: true,
      message: "User deleted successfully.",
      data: null
    });
  });

  app.get("/api/admin/addresses", authMiddleware(["ADMIN"]), (req, res) => {
    res.json({
      success: true,
      message: "Addresses list retrieved.",
      data: addresses
    });
  });

  app.post("/api/admin/addresses", authMiddleware(["ADMIN"]), (req, res) => {
    const { label, addressLine, latitude, longitude, isFrequent, userId } = req.body;
    if (!label || !addressLine || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ success: false, message: "Missing required parameters.", data: null });
    }

    let linkedUser = null;
    if (userId) {
      linkedUser = users.find(u => u.id === parseInt(userId)) || null;
    }

    const newAddress: Address = {
      id: addresses.length + 1,
      userId: linkedUser ? linkedUser.id : null,
      userName: linkedUser ? linkedUser.name : undefined,
      label,
      addressLine,
      latitude: Number(latitude),
      longitude: Number(longitude),
      isFrequent: isFrequent === true || isFrequent === "true"
    };

    addresses.push(newAddress);
    res.json({
      success: true,
      message: "Address created successfully.",
      data: newAddress
    });
  });

  app.put("/api/admin/addresses/:id", authMiddleware(["ADMIN"]), (req, res) => {
    const addressId = parseInt(req.params.id);
    const { label, addressLine, latitude, longitude, isFrequent, userId } = req.body;

    const address = addresses.find(a => a.id === addressId);
    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found.", data: null });
    }

    if (label) address.label = label;
    if (addressLine) address.addressLine = addressLine;
    if (latitude !== undefined) address.latitude = Number(latitude);
    if (longitude !== undefined) address.longitude = Number(longitude);
    if (isFrequent !== undefined) address.isFrequent = isFrequent === true || isFrequent === "true";

    if (userId !== undefined) {
      const linkedUser = users.find(u => u.id === parseInt(userId)) || null;
      address.userId = linkedUser ? linkedUser.id : null;
      address.userName = linkedUser ? linkedUser.name : undefined;
    }

    res.json({
      success: true,
      message: "Address updated successfully.",
      data: address
    });
  });

  app.delete("/api/admin/addresses/:id", authMiddleware(["ADMIN"]), (req, res) => {
    const addressId = parseInt(req.params.id);
    const index = addresses.findIndex(a => a.id === addressId);
    if (index === -1) {
      return res.status(404).json({ success: false, message: "Address not found.", data: null });
    }

    addresses.splice(index, 1);
    res.json({
      success: true,
      message: "Address deleted successfully.",
      data: null
    });
  });

  // --- GENERAL DELIVERY DETAIL ENDPOINT ---
  app.get("/api/deliveries/:id", authMiddleware(["ADMIN", "CLIENT", "COURIER"]), (req, res) => {
    const deliveryId = parseInt(req.params.id);
    const actor = (req as any).user as User;

    const delivery = deliveries.find(d => d.id === deliveryId);
    if (!delivery) {
      return res.status(404).json({ success: false, message: "Delivery not found.", data: null });
    }

    // Access control check
    if (actor.role === "CLIENT" && delivery.clientId !== actor.id) {
      return res.status(403).json({ success: false, message: "You are not authorized to view this delivery.", data: null });
    }
    if (actor.role === "COURIER" && delivery.courierId !== actor.id) {
      return res.status(403).json({ success: false, message: "You are not authorized to view this delivery.", data: null });
    }

    res.json({
      success: true,
      message: "Delivery details retrieved.",
      data: delivery
    });
  });

  // --- CLIENT ENDPOINTS ---
  app.post("/api/client/deliveries", authMiddleware(["CLIENT"]), (req, res) => {
    const { pickupAddressId, dropoffAddressId } = req.body;
    const actor = (req as any).user as User;

    if (!pickupAddressId || !dropoffAddressId) {
      return res.status(400).json({ success: false, message: "Pickup and drop-off addresses are required.", data: null });
    }

    const pickup = addresses.find(a => a.id === parseInt(pickupAddressId));
    const dropoff = addresses.find(a => a.id === parseInt(dropoffAddressId));

    if (!pickup || !dropoff) {
      return res.status(404).json({ success: false, message: "Pickup or drop-off address not found.", data: null });
    }

    const newDelivery: Delivery = {
      id: deliveries.length + 1,
      clientId: actor.id,
      client: { id: actor.id, name: actor.name, email: actor.email, role: actor.role },
      courierId: null,
      courier: null,
      pickupAddressId: pickup.id,
      pickupAddress: pickup,
      dropoffAddressId: dropoff.id,
      dropoffAddress: dropoff,
      status: "CREATED",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    deliveries.push(newDelivery);

    const log: StatusLog = {
      id: statusLogs.length + 1,
      deliveryId: newDelivery.id,
      status: "CREATED",
      changedBy: { id: actor.id, name: actor.name, email: actor.email, role: actor.role },
      changedAt: new Date().toISOString(),
      notes: "Delivery requested on the campus."
    };
    statusLogs.push(log);

    res.json({
      success: true,
      message: "Delivery request submitted successfully.",
      data: newDelivery
    });
  });

  app.get("/api/client/deliveries", authMiddleware(["CLIENT"]), (req, res) => {
    const actor = (req as any).user as User;
    const clientDeliveries = deliveries.filter(d => d.clientId === actor.id);
    res.json({
      success: true,
      message: "Client delivery history retrieved.",
      data: clientDeliveries
    });
  });

  app.get("/api/client/deliveries/:id/status", authMiddleware(["CLIENT", "ADMIN"]), (req, res) => {
    const deliveryId = parseInt(req.params.id);
    const delivery = deliveries.find(d => d.id === deliveryId);
    if (!delivery) {
      return res.status(404).json({ success: false, message: "Delivery not found.", data: null });
    }
    res.json({
      success: true,
      message: "Delivery status retrieved.",
      data: delivery.status
    });
  });

  app.get("/api/client/deliveries/:id/logs", authMiddleware(["CLIENT", "ADMIN", "COURIER"]), (req, res) => {
    const deliveryId = parseInt(req.params.id);
    const logs = statusLogs.filter(l => l.deliveryId === deliveryId).sort((a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime());
    res.json({
      success: true,
      message: "Delivery timeline logs retrieved.",
      data: logs
    });
  });

  // --- COURIER ENDPOINTS ---
  app.get("/api/courier/deliveries", authMiddleware(["COURIER"]), (req, res) => {
    const actor = (req as any).user as User;
    const courierDeliveries = deliveries.filter(d => d.courierId === actor.id);
    res.json({
      success: true,
      message: "Courier assigned deliveries list.",
      data: courierDeliveries
    });
  });

  app.put("/api/courier/deliveries/:id/status", authMiddleware(["COURIER"]), (req, res) => {
    const deliveryId = parseInt(req.params.id);
    const { status, notes } = req.body;
    const actor = (req as any).user as User;

    const delivery = deliveries.find(d => d.id === deliveryId);
    if (!delivery) {
      return res.status(404).json({ success: false, message: "Delivery not found.", data: null });
    }

    if (delivery.courierId !== actor.id) {
      return res.status(403).json({ success: false, message: "You are not the assigned courier for this delivery.", data: null });
    }

    // Validate status transitions
    const currentStatus = delivery.status;
    let isValid = false;

    if (currentStatus === "CREATED" && status === "PICKED_UP") isValid = true;
    else if (currentStatus === "PICKED_UP" && status === "EN_ROUTE") isValid = true;
    else if (currentStatus === "EN_ROUTE" && status === "DELIVERED") isValid = true;

    if (!isValid) {
      return res.status(400).json({ success: false, message: `Invalid status transition from ${currentStatus} to ${status}.`, data: null });
    }

    delivery.status = status;
    delivery.updatedAt = new Date().toISOString();

    const log: StatusLog = {
      id: statusLogs.length + 1,
      deliveryId,
      status,
      changedBy: { id: actor.id, name: actor.name, email: actor.email, role: actor.role },
      changedAt: new Date().toISOString(),
      notes: notes || `Status updated to ${status}`
    };
    statusLogs.push(log);

    res.json({
      success: true,
      message: "Delivery status updated successfully.",
      data: delivery
    });
  });

  // --- INTEGRATION WITH VITE AS MIDDLEWARE IN DEV MODE ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[FULLSTACK CORE] Express server with API active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
