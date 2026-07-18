CREATE TABLE roles (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,

    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,

    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,

    username VARCHAR(50) UNIQUE,
    profile_picture VARCHAR(255),
    bio TEXT,
    location VARCHAR(100),

    github_url VARCHAR(255),
    linkedin_url VARCHAR(255),
    portfolio_url VARCHAR(255),

    experience_level ENUM(
        'beginner','junior','mid_level','senior',
        'lead','manager','principal','architect'
    ) DEFAULT 'beginner',

    role_id VARCHAR(36) NOT NULL,

    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255) NULL,
    verification_token_expires TIMESTAMP NULL,

    FOREIGN KEY (role_id) REFERENCES roles(id),

    INDEX idx_users_email (email),
    INDEX idx_users_experience (experience_level)
);

CREATE TABLE skills (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL UNIQUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_skills (
    user_id VARCHAR(36),
    skill_id VARCHAR(36),

    PRIMARY KEY (user_id, skill_id),

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

CREATE TABLE session_requests (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),

    requester_id VARCHAR(36) NOT NULL,
    recipient_id VARCHAR(36) NOT NULL,
    skill_id VARCHAR(36) NOT NULL,

    message TEXT,

    status ENUM('pending','accepted','rejected','cancelled') DEFAULT 'pending',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id),

    INDEX idx_requests_status (status),
    INDEX idx_requests_recipient (recipient_id)
);

CREATE TABLE sessions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),

    request_id VARCHAR(36) NOT NULL UNIQUE,

    scheduled_at DATETIME NOT NULL,
    duration_minutes INT DEFAULT 60,

    status ENUM('scheduled','completed','cancelled', 'expired') DEFAULT 'scheduled',

    meeting_link VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (request_id) REFERENCES session_requests(id) ON DELETE CASCADE
);

CREATE TABLE messages (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),

    session_id VARCHAR(36),
    sender_id VARCHAR(36),
    receiver_id VARCHAR(36),

    message TEXT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE SET NULL,

    INDEX idx_messages_receiver (receiver_id),
    INDEX idx_messages_session (session_id)
);

CREATE TABLE notifications (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),

    user_id VARCHAR(36),
    type VARCHAR(50),
    message TEXT,

    is_read BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notifications_user_read (user_id, is_read)
);



