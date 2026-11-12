-- CommuteSafe SA: migration 002
-- Adds emergency contacts, shared trips, taxi ranks and in-app notifications.
-- Safe to run more than once (IF NOT EXISTS / INSERT IGNORE). Does not touch existing data.
--
-- Run from the backend folder:
--   Get-Content db\migration_002_features.sql | mysql -u root -p

USE commutesafe;

CREATE TABLE IF NOT EXISTS emergency_contacts (
  contact_id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  relationship VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_contacts_user (user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS trips (
  trip_id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  registration_number VARCHAR(20),
  origin VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  shared_with TEXT,
  status ENUM('active','arrived','cancelled') DEFAULT 'active',
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_trips_user_status (user_id, status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS taxi_ranks (
  rank_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  area VARCHAR(80),
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  routes TEXT,
  -- word used to match report locations to this rank, e.g. "Bellville"
  keyword VARCHAR(60) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notifications (
  notification_id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  type VARCHAR(30) NOT NULL,
  title VARCHAR(150) NOT NULL,
  body TEXT,
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_notifications_user (user_id, is_read, created_at)
) ENGINE=InnoDB;

-- Demo data: major Cape Town taxi ranks.
-- Coordinates are APPROXIMATE and routes are simplified examples for the prototype.
INSERT IGNORE INTO taxi_ranks (name, area, latitude, longitude, routes, keyword) VALUES
('Cape Town Station Deck', 'Cape Town CBD', -33.9227, 18.4253, 'Bellville, Khayelitsha, Mitchells Plain, Wynberg, Nyanga', 'CBD'),
('Bellville Taxi Rank', 'Bellville', -33.9035, 18.6290, 'Cape Town CBD, Khayelitsha, Delft, Parow', 'Bellville'),
('Wynberg Taxi Rank', 'Wynberg', -34.0007, 18.4680, 'Cape Town CBD, Claremont, Retreat, Mitchells Plain', 'Wynberg'),
('Mitchells Plain Town Centre', 'Mitchells Plain', -34.0475, 18.6170, 'Cape Town CBD, Wynberg, Khayelitsha', 'Mitchells Plain'),
('Khayelitsha Site C', 'Khayelitsha', -34.0400, 18.6630, 'Cape Town CBD, Bellville, Mitchells Plain', 'Khayelitsha'),
('Nyanga Junction', 'Nyanga', -33.9890, 18.5800, 'Cape Town CBD, Gugulethu, Philippi', 'Nyanga'),
('Claremont Taxi Rank', 'Claremont', -33.9810, 18.4650, 'Cape Town CBD, Wynberg, Hout Bay', 'Claremont'),
('Mowbray Taxi Rank', 'Mowbray', -33.9460, 18.4740, 'Cape Town CBD, Langa, Observatory', 'Mowbray'),
('Langa Taxi Rank', 'Langa', -33.9440, 18.5290, 'Cape Town CBD, Mowbray, Bellville', 'Langa');
