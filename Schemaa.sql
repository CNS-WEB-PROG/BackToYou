-- BackToYou database schema
-- MariaDB 10.4

CREATE DATABASE IF NOT EXISTS backtoyou
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

USE backtoyou;


-- ------------------------------------------------------
-- users
-- ------------------------------------------------------
CREATE TABLE users (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    fullname   VARCHAR(100) NOT NULL,
    email      VARCHAR(100) NOT NULL UNIQUE,
    phone      VARCHAR(20),
    password   VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- ------------------------------------------------------
-- items
-- ------------------------------------------------------
CREATE TABLE items (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    item_type   ENUM('lost', 'found') NOT NULL,
    item_name   VARCHAR(100) NOT NULL,
    description TEXT,
    location    VARCHAR(255),
    image       VARCHAR(255),
    status      ENUM('open', 'claimed', 'resolved') DEFAULT 'open',
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- ------------------------------------------------------
-- claims
-- ------------------------------------------------------
CREATE TABLE claims (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    item_id      INT NOT NULL,
    claimant_id  INT NOT NULL,
    claim_status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    claim_date   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (item_id)     REFERENCES items(id) ON DELETE CASCADE,
    FOREIGN KEY (claimant_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- ------------------------------------------------------
-- notifications
-- ------------------------------------------------------
CREATE TABLE notifications (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT NOT NULL,
    message    TEXT NOT NULL,
    is_read    TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
