CREATE DATABASE IF NOT EXISTS commutesafe
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE commutesafe;

CREATE TABLE users (
  user_id CHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20) UNIQUE,
  role ENUM('passenger','driver') NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE drivers (
  driver_id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NULL,
  name VARCHAR(100) NOT NULL,
  flag_count INT DEFAULT 0,
  flag_status ENUM('clear','under_review','flagged') DEFAULT 'clear',
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE vehicles (
  vehicle_id CHAR(36) PRIMARY KEY,
  driver_id CHAR(36),
  registration_number VARCHAR(20) UNIQUE NOT NULL,
  FOREIGN KEY (driver_id) REFERENCES drivers(driver_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE reports (
  report_id CHAR(36) PRIMARY KEY,
  user_id CHAR(36),
  vehicle_id CHAR(36) NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  photo_url TEXT,
  location VARCHAR(255),
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  severity INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE SET NULL,
  INDEX idx_reports_created (created_at),
  INDEX idx_reports_vehicle (vehicle_id)
) ENGINE=InnoDB;

CREATE TABLE sos_alerts (
  alert_id CHAR(36) PRIMARY KEY,
  user_id CHAR(36),
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
  INDEX idx_sos_created (created_at)
) ENGINE=InnoDB;