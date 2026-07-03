-- Seed Data for Campus Delivery Database
-- BCrypt hash of "password123" is $2a$10$8.0bK5ry.xGpfB.rS3nbe.Wk34sKGP07K6vM96N84YgL2i5V.P9a2

-- 1. Insert Users
INSERT INTO users (id, name, email, password_hash, role, created_at) VALUES
(1, 'Admin Oussama', 'admin@campusdelivery.com', '$2a$10$8.0bK5ry.xGpfB.rS3nbe.Wk34sKGP07K6vM96N84YgL2i5V.P9a2', 'ADMIN', NOW() - INTERVAL 10 DAY),
(2, 'Client Youssef', 'client.youssef@gmail.com', '$2a$10$8.0bK5ry.xGpfB.rS3nbe.Wk34sKGP07K6vM96N84YgL2i5V.P9a2', 'CLIENT', NOW() - INTERVAL 9 DAY),
(3, 'Client Sarah', 'client.sarah@gmail.com', '$2a$10$8.0bK5ry.xGpfB.rS3nbe.Wk34sKGP07K6vM96N84YgL2i5V.P9a2', 'CLIENT', NOW() - INTERVAL 8 DAY),
(4, 'Courier Ahmed', 'courier.ahmed@campusdelivery.com', '$2a$10$8.0bK5ry.xGpfB.rS3nbe.Wk34sKGP07K6vM96N84YgL2i5V.P9a2', 'COURIER', NOW() - INTERVAL 7 DAY),
(5, 'Courier Fatima', 'courier.fatima@campusdelivery.com', '$2a$10$8.0bK5ry.xGpfB.rS3nbe.Wk34sKGP07K6vM96N84YgL2i5V.P9a2', 'COURIER', NOW() - INTERVAL 6 DAY);

-- 2. Insert Addresses (Frequent delivery points and client addresses)
INSERT INTO addresses (id, user_id, label, address_line, latitude, longitude, is_frequent) VALUES
(1, NULL, 'Science Block Library', 'Central Campus, Science Building, Gate 2', 33.5731, -7.5898, TRUE),
(2, NULL, 'Main Student Residence', 'Block C, Room 104, Campus Housing', 33.5722, -7.5912, TRUE),
(3, NULL, 'University Cafeteria', 'East Wing, Food Court Area', 33.5745, -7.5872, TRUE),
(4, 2, 'Youssef''s Dormitory', 'Block A, Room 302, Student Housing', 33.5715, -7.5930, FALSE),
(5, 3, 'Sarah''s Department Office', 'Engineering Building, Floor 2, Room 205', 33.5750, -7.5850, FALSE);

-- 3. Insert Deliveries (10 items spanning various statuses)
INSERT INTO deliveries (id, client_id, courier_id, pickup_address_id, dropoff_address_id, status, created_at, updated_at) VALUES
(1, 2, 4, 3, 4, 'DELIVERED', NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 3 DAY + INTERVAL 30 MINUTE),
(2, 3, 5, 1, 5, 'DELIVERED', NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 2 DAY + INTERVAL 45 MINUTE),
(3, 2, 4, 1, 2, 'DELIVERED', NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 1 DAY + INTERVAL 25 MINUTE),
(4, 3, NULL, 3, 2, 'CREATED', NOW() - INTERVAL 4 HOUR, NOW() - INTERVAL 4 HOUR),
(5, 2, 4, 2, 1, 'PICKED_UP', NOW() - INTERVAL 3 HOUR, NOW() - INTERVAL 1 HOUR),
(6, 3, 5, 3, 5, 'EN_ROUTE', NOW() - INTERVAL 2 HOUR, NOW() - INTERVAL 30 MINUTE),
(7, 2, 4, 1, 4, 'DELIVERED', NOW() - INTERVAL 5 HOUR, NOW() - INTERVAL 4 HOUR),
(8, 3, 5, 2, 5, 'CANCELED', NOW() - INTERVAL 6 HOUR, NOW() - INTERVAL 5 HOUR),
(9, 2, NULL, 1, 3, 'CREATED', NOW() - INTERVAL 30 MINUTE, NOW() - INTERVAL 30 MINUTE),
(10, 3, 4, 3, 1, 'EN_ROUTE', NOW() - INTERVAL 1 HOUR, NOW() - INTERVAL 15 MINUTE);

-- 4. Insert Status Logs for the 10 deliveries
INSERT INTO delivery_status_logs (delivery_id, status, changed_by, changed_at, notes) VALUES
-- Delivery 1 (DELIVERED)
(1, 'CREATED', 2, NOW() - INTERVAL 3 DAY, 'Delivery requested for warm meal.'),
(1, 'PICKED_UP', 4, NOW() - INTERVAL 3 DAY + INTERVAL 10 MINUTE, 'Courier Ahmed picked up the meal from Cafeteria.'),
(1, 'EN_ROUTE', 4, NOW() - INTERVAL 3 DAY + INTERVAL 15 MINUTE, 'En route to dorm.'),
(1, 'DELIVERED', 4, NOW() - INTERVAL 3 DAY + INTERVAL 30 MINUTE, 'Delivered to room. Client signed.'),

-- Delivery 2 (DELIVERED)
(2, 'CREATED', 3, NOW() - INTERVAL 2 DAY, 'Requested urgent document drop-off.'),
(2, 'PICKED_UP', 5, NOW() - INTERVAL 2 DAY + INTERVAL 15 MINUTE, 'Courier Fatima picked up textbooks.'),
(2, 'EN_ROUTE', 5, NOW() - INTERVAL 2 DAY + INTERVAL 20 MINUTE, 'En route to Engineering Dept.'),
(2, 'DELIVERED', 5, NOW() - INTERVAL 2 DAY + INTERVAL 45 MINUTE, 'Left at secretary office as requested.'),

-- Delivery 3 (DELIVERED)
(3, 'CREATED', 2, NOW() - INTERVAL 1 DAY, 'Returning borrowed books to Library.'),
(3, 'PICKED_UP', 4, NOW() - INTERVAL 1 DAY + INTERVAL 5 MINUTE, 'Picked up from student residence.'),
(3, 'DELIVERED', 4, NOW() - INTERVAL 1 DAY + INTERVAL 25 MINUTE, 'Returned to library desk.'),

-- Delivery 4 (CREATED)
(4, 'CREATED', 3, NOW() - INTERVAL 4 HOUR, 'Order for lunch delivery from Cafeteria.'),

-- Delivery 5 (PICKED_UP)
(5, 'CREATED', 2, NOW() - INTERVAL 3 HOUR, 'Courier requested to bring coat from dorm.'),
(5, 'PICKED_UP', 4, NOW() - INTERVAL 1 HOUR, 'Picked up coat. Starting delivery soon.'),

-- Delivery 6 (EN_ROUTE)
(6, 'CREATED', 3, NOW() - INTERVAL 2 HOUR, 'Requested snack delivery.'),
(6, 'PICKED_UP', 5, NOW() - INTERVAL 1 HOUR, 'Picked up from cafeteria.'),
(6, 'EN_ROUTE', 5, NOW() - INTERVAL 30 MINUTE, 'Cycling to office block.'),

-- Delivery 7 (DELIVERED)
(7, 'CREATED', 2, NOW() - INTERVAL 5 HOUR, 'Lab report delivery to Science Block.'),
(7, 'PICKED_UP', 4, NOW() - INTERVAL 4 HOUR - INTERVAL 40 MINUTE, 'Picked up from client.'),
(7, 'DELIVERED', 4, NOW() - INTERVAL 4 HOUR, 'Slipped under door.'),

-- Delivery 8 (CANCELED)
(8, 'CREATED', 3, NOW() - INTERVAL 6 HOUR, 'Forgot keys, need courier help.'),
(8, 'CANCELED', 1, NOW() - INTERVAL 5 HOUR, 'Canceled by admin: client found keys.'),

-- Delivery 9 (CREATED)
(9, 'CREATED', 2, NOW() - INTERVAL 30 MINUTE, 'Library laptop return service request.'),

-- Delivery 10 (EN_ROUTE)
(10, 'CREATED', 3, NOW() - INTERVAL 1 HOUR, 'Requested printing service Delivery.'),
(10, 'PICKED_UP', 4, NOW() - INTERVAL 40 MINUTE, 'Printing done. Courier Ahmed heading to dropoff.'),
(10, 'EN_ROUTE', 4, NOW() - INTERVAL 15 MINUTE, 'Heading to Science Block.');
