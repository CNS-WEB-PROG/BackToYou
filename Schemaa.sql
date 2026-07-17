CREATE DATABASE IF NOT EXISTS backtoyou
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;
USE backtoyou;

CREATE TABLE IF NOT EXISTS users (
    id         INT          NOT NULL AUTO_INCREMENT,
    fullname   VARCHAR(100) NOT NULL,
    email      VARCHAR(100) NOT NULL,
    phone      VARCHAR(20)           DEFAULT NULL,
    password   VARCHAR(255) NOT NULL,
    student_id VARCHAR(20)           DEFAULT NULL,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS items (
    id          INT          NOT NULL AUTO_INCREMENT,
    user_id     INT          NOT NULL,
    item_type   ENUM('lost','found') NOT NULL,
    item_name   VARCHAR(100) NOT NULL,
    description TEXT                  DEFAULT NULL,
    location    VARCHAR(255)          DEFAULT NULL,
    image       VARCHAR(255)          DEFAULT NULL,
    status      ENUM('open','claimed','resolved') NOT NULL DEFAULT 'open',
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_user_id (user_id),
    KEY idx_item_type (item_type),
    KEY idx_status (status),
    CONSTRAINT fk_items_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS claims (
    id           INT  NOT NULL AUTO_INCREMENT,
    item_id      INT  NOT NULL,
    claimant_id  INT  NOT NULL,
    claim_status ENUM('Pending','Approved','Rejected') NOT NULL DEFAULT 'Pending',
    claim_date   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_item_id (item_id),
    KEY idx_claimant_id (claimant_id),
    CONSTRAINT fk_claims_item     FOREIGN KEY (item_id)     REFERENCES items (id) ON DELETE CASCADE,
    CONSTRAINT fk_claims_claimant FOREIGN KEY (claimant_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS notifications (
    id         INT  NOT NULL AUTO_INCREMENT,
    user_id    INT  NOT NULL,
    message    TEXT NOT NULL,
    is_read    TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_user_id (user_id),
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS matches (
    id            INT   NOT NULL AUTO_INCREMENT,
    lost_item_id  INT   NOT NULL,
    found_item_id INT   NOT NULL,
    score         FLOAT NOT NULL DEFAULT 0,
    notified      TINYINT(1) NOT NULL DEFAULT 0,
    created_at    TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_lost_item  (lost_item_id),
    KEY idx_found_item (found_item_id),
    CONSTRAINT fk_match_lost  FOREIGN KEY (lost_item_id)  REFERENCES items (id) ON DELETE CASCADE,
    CONSTRAINT fk_match_found FOREIGN KEY (found_item_id) REFERENCES items (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

ALTER TABLE items ADD FULLTEXT INDEX ft_search (item_name, description);