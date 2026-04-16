ALTER TABLE users
ADD COLUMN refresh_token VARCHAR(255) NULL AFTER verification_token_expires;
