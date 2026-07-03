-- Campus Delivery Database Schema
-- Target Database: MySQL

CREATE DATABASE IF NOT EXISTS campus_delivery_db;
USE campus_delivery_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'CLIENT', 'COURIER') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Addresses Table
CREATE TABLE IF NOT EXISTS addresses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    label VARCHAR(100) NOT NULL,
    address_line VARCHAR(255) NOT NULL,
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    is_frequent BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Deliveries Table
CREATE TABLE IF NOT EXISTS deliveries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    courier_id INT NULL,
    pickup_address_id INT NOT NULL,
    dropoff_address_id INT NOT NULL,
    status ENUM('CREATED', 'PICKED_UP', 'EN_ROUTE', 'DELIVERED', 'CANCELED') NOT NULL DEFAULT 'CREATED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (courier_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (pickup_address_id) REFERENCES addresses(id) ON DELETE RESTRICT,
    FOREIGN KEY (dropoff_address_id) REFERENCES addresses(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Delivery Status Logs Table
CREATE TABLE IF NOT EXISTS delivery_status_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    delivery_id INT NOT NULL,
    status ENUM('CREATED', 'PICKED_UP', 'EN_ROUTE', 'DELIVERED', 'CANCELED') NOT NULL,
    changed_by INT NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (delivery_id) REFERENCES deliveries(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Indexes for Performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_deliveries_client_id ON deliveries(client_id);
CREATE INDEX idx_deliveries_courier_id ON deliveries(courier_id);
CREATE INDEX idx_delivery_logs_delivery_id ON delivery_status_logs(delivery_id);
