-- =========================================================
--  MWAU – Mamoratwa Wa Afrika
--  MySQL Database Schema
--  Ready for backend integration
-- =========================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------
-- 1. PLANS
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS plans (
  id            VARCHAR(20)     NOT NULL PRIMARY KEY,        -- 'comfort', 'prestige', 'legacy'
  name          VARCHAR(100)    NOT NULL,
  price         DECIMAL(10,2)   NOT NULL,
  cover_amount  DECIMAL(12,2)   NOT NULL,
  waiting_months TINYINT        NOT NULL DEFAULT 6,
  max_spouse    TINYINT         NOT NULL DEFAULT 1,
  max_child     TINYINT         NOT NULL DEFAULT 4,
  max_extended  TINYINT         NOT NULL DEFAULT 0,
  features      JSON            NULL,                        -- JSON array of feature strings
  is_active     TINYINT(1)      NOT NULL DEFAULT 1,
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO plans (id, name, price, cover_amount, waiting_months, max_spouse, max_child, max_extended, features) VALUES
('comfort',  'Comfort Plan',  170.00, 15000.00, 6, 1, 4, 0, '["R15,000 funeral cover","Professional embalming","Standard coffin (choice of 3)","Hearse transport (within 50km)","One night viewing","Administrative assistance"]'),
('prestige', 'Prestige Plan', 210.00, 25000.00, 3, 1, 6, 2, '["R25,000 funeral cover","Professional embalming","Premium coffin (choice of 8)","Hearse transport (within 100km)","Two nights viewing","Catering for 50 guests","Floral arrangements"]'),
('legacy',   'Legacy Plan',   240.00, 35000.00, 1, 1, 8, 4, '["R35,000 funeral cover","Professional embalming","Luxury coffin (choice of 15)","Hearse + 2 family vehicles","Three nights viewing","Catering for 100 guests","Premium floral arrangements","Tombstone contribution (R3,000)"]');

-- ---------------------------------------------------------
-- 2. USERS (Members & Admins)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id                VARCHAR(20)     NOT NULL PRIMARY KEY,    -- e.g. USR001
  email             VARCHAR(255)    NOT NULL UNIQUE,
  password_hash     VARCHAR(255)    NOT NULL,                -- bcrypt hash
  role              ENUM('member','admin') NOT NULL DEFAULT 'member',
  first_name        VARCHAR(100)    NOT NULL,
  last_name         VARCHAR(100)    NOT NULL,
  id_number         VARCHAR(13)     NULL,                    -- SA ID, unique per member
  date_of_birth     DATE            NULL,
  gender            ENUM('Male','Female','Other') NULL,
  phone             VARCHAR(20)     NULL,
  address_street    VARCHAR(255)    NULL,
  address_city      VARCHAR(100)    NULL,
  address_province  VARCHAR(100)    NULL,
  address_postal    VARCHAR(10)     NULL,
  plan_id           VARCHAR(20)     NULL,
  status            ENUM('pending','active','inactive','rejected','suspended') NOT NULL DEFAULT 'pending',
  premium_paid      TINYINT(1)      NOT NULL DEFAULT 0,
  join_date         DATE            NULL,
  notes             TEXT            NULL,                    -- admin notes
  created_at        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_plan FOREIGN KEY (plan_id) REFERENCES plans(id) ON UPDATE CASCADE ON DELETE SET NULL,
  INDEX idx_user_status (status),
  INDEX idx_user_plan   (plan_id),
  INDEX idx_user_role   (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- 3. DEPENDANTS
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS dependants (
  id            VARCHAR(20)     NOT NULL PRIMARY KEY,        -- e.g. DEP001
  member_id     VARCHAR(20)     NOT NULL,
  relationship  ENUM('Spouse','Child','Extended') NOT NULL,
  first_name    VARCHAR(100)    NOT NULL,
  last_name     VARCHAR(100)    NOT NULL,
  id_number     VARCHAR(13)     NULL,
  date_of_birth DATE            NULL,
  gender        ENUM('Male','Female','Other') NULL,
  status        ENUM('active','inactive','deceased') NOT NULL DEFAULT 'active',
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_dep_member FOREIGN KEY (member_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_dep_member (member_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- 4. CLAIMS
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS claims (
  id                    VARCHAR(20)     NOT NULL PRIMARY KEY,  -- e.g. CLM001
  member_id             VARCHAR(20)     NOT NULL,
  submitted_by          ENUM('member','admin') NOT NULL DEFAULT 'member',
  submitted_by_user_id  VARCHAR(20)     NOT NULL,

  -- Deceased details
  deceased_first_name   VARCHAR(100)    NOT NULL,
  deceased_last_name    VARCHAR(100)    NOT NULL,
  deceased_id_number    VARCHAR(13)     NULL,
  deceased_dob          DATE            NULL,
  deceased_dod          DATE            NOT NULL,
  deceased_relationship VARCHAR(100)    NOT NULL,
  cause_of_death        VARCHAR(255)    NOT NULL,

  -- Funeral details
  funeral_home          VARCHAR(255)    NULL,
  funeral_date          DATE            NULL,

  -- Banking details for payout
  bank_name             VARCHAR(100)    NULL,
  account_number        VARCHAR(30)     NULL,
  branch_code           VARCHAR(10)     NULL,
  account_type          ENUM('Cheque','Savings','Transmission') NULL,

  -- Financials
  claim_amount          DECIMAL(12,2)   NOT NULL,

  -- Status & workflow
  status                ENUM('submitted','documents_pending','under_review','approved','paid_out','rejected') NOT NULL DEFAULT 'submitted',
  admin_notes           TEXT            NULL,
  rejection_reason      TEXT            NULL,

  -- Timestamps
  date_submitted        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  date_reviewed         DATETIME        NULL,
  date_approved         DATETIME        NULL,
  date_paid_out         DATETIME        NULL,
  date_rejected         DATETIME        NULL,
  created_at            DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_claim_member    FOREIGN KEY (member_id)            REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_claim_submitter FOREIGN KEY (submitted_by_user_id) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_claim_member (member_id),
  INDEX idx_claim_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- 5. CLAIM DOCUMENTS
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS claim_documents (
  id            INT UNSIGNED    NOT NULL AUTO_INCREMENT PRIMARY KEY,
  claim_id      VARCHAR(20)     NOT NULL,
  document_type ENUM(
    'death_certificate',
    'deceased_id',
    'member_id',
    'funeral_invoice',
    'proof_of_relationship',
    'other'
  ) NOT NULL,
  file_name     VARCHAR(255)    NOT NULL,
  file_path     VARCHAR(500)    NOT NULL,                    -- server path or S3 key
  file_size     INT UNSIGNED    NULL,                        -- bytes
  mime_type     VARCHAR(100)    NULL,
  uploaded_by   VARCHAR(20)     NOT NULL,                    -- user id
  uploaded_at   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_doc_claim    FOREIGN KEY (claim_id)    REFERENCES claims(id) ON DELETE CASCADE,
  CONSTRAINT fk_doc_uploader FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_doc_claim (claim_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- 6. CLAIM TIMELINE / AUDIT LOG
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS claim_timeline (
  id            INT UNSIGNED    NOT NULL AUTO_INCREMENT PRIMARY KEY,
  claim_id      VARCHAR(20)     NOT NULL,
  stage         VARCHAR(100)    NOT NULL,                    -- 'Submitted', 'Documents Verified', etc.
  status        VARCHAR(50)     NOT NULL,
  notes         TEXT            NULL,
  changed_by    VARCHAR(20)     NULL,                        -- user id of admin/member who triggered
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_timeline_claim FOREIGN KEY (claim_id) REFERENCES claims(id) ON DELETE CASCADE,
  INDEX idx_timeline_claim (claim_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- 7. PAYMENTS (Premium tracking)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
  id              INT UNSIGNED    NOT NULL AUTO_INCREMENT PRIMARY KEY,
  member_id       VARCHAR(20)     NOT NULL,
  amount          DECIMAL(10,2)   NOT NULL,
  payment_method  ENUM('eft','card','cash','other') NOT NULL DEFAULT 'eft',
  reference       VARCHAR(100)    NULL,                      -- EFT ref or card transaction ID
  period_month    TINYINT         NOT NULL,                  -- 1–12
  period_year     SMALLINT        NOT NULL,
  status          ENUM('pending','confirmed','failed','reversed') NOT NULL DEFAULT 'pending',
  confirmed_by    VARCHAR(20)     NULL,                      -- admin user id
  notes           TEXT            NULL,
  created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_payment_member    FOREIGN KEY (member_id)    REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_payment_member (member_id),
  INDEX idx_payment_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- 8. SYSTEM SETTINGS (admin-configurable key-value pairs)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS system_settings (
  setting_key   VARCHAR(100)    NOT NULL PRIMARY KEY,
  setting_value TEXT            NOT NULL,
  description   VARCHAR(255)    NULL,
  updated_by    VARCHAR(20)     NULL,
  updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('email_notifications_enabled', '1',       'Send email notifications to members on status changes'),
('auto_reject_incomplete_claims','0',       'Auto-flag claims with missing docs after 14 days'),
('waiting_period_enforcement',   '1',       'Block claims submitted within plan waiting period'),
('comfort_max_spouse',           '1',       'Comfort plan: max spouse dependants'),
('comfort_max_child',            '4',       'Comfort plan: max child dependants'),
('comfort_max_extended',         '0',       'Comfort plan: max extended family dependants'),
('prestige_max_spouse',          '1',       'Prestige plan: max spouse dependants'),
('prestige_max_child',           '6',       'Prestige plan: max child dependants'),
('prestige_max_extended',        '2',       'Prestige plan: max extended family dependants'),
('legacy_max_spouse',            '1',       'Legacy plan: max spouse dependants'),
('legacy_max_child',             '8',       'Legacy plan: max child dependants'),
('legacy_max_extended',          '4',       'Legacy plan: max extended family dependants');

-- ---------------------------------------------------------
-- 9. ACTIVITY LOG (admin audit trail)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS activity_log (
  id            INT UNSIGNED    NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id       VARCHAR(20)     NULL,
  action        VARCHAR(100)    NOT NULL,                    -- e.g. 'member_approved', 'claim_status_changed'
  target_type   VARCHAR(50)     NULL,                        -- 'user', 'claim', 'payment', etc.
  target_id     VARCHAR(50)     NULL,
  details       JSON            NULL,
  ip_address    VARCHAR(45)     NULL,
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_log_user   (user_id),
  INDEX idx_log_action (action),
  INDEX idx_log_target (target_type, target_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- 10. FEEDBACK / MESSAGES
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS feedback (
  id            INT UNSIGNED    NOT NULL AUTO_INCREMENT PRIMARY KEY,
  type          ENUM('compliment','complaint','enquiry') NOT NULL,
  first_name    VARCHAR(100)    NOT NULL,
  last_name     VARCHAR(100)    NOT NULL,
  email         VARCHAR(255)    NOT NULL,
  phone         VARCHAR(20)     NULL,
  branch        VARCHAR(100)    NULL,
  subject       VARCHAR(255)    NOT NULL,
  message       TEXT            NOT NULL,
  rating        TINYINT         NULL,                        -- 1–5 stars
  attachment    VARCHAR(500)    NULL,                        -- file path
  status        ENUM('new','read','responded','closed') NOT NULL DEFAULT 'new',
  response      TEXT            NULL,
  responded_by  VARCHAR(20)     NULL,
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_feedback_status (status),
  INDEX idx_feedback_type   (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- =========================================================
--  END OF SCHEMA
--  Notes:
--  - All VARCHAR IDs use application-generated prefixed values (USR001, CLM001, etc.)
--  - Passwords must be stored as bcrypt hashes only (min cost factor 12)
--  - claim_documents.file_path should point to secure, non-public storage
--  - system_settings rows are managed via the admin Settings pane
-- =========================================================
