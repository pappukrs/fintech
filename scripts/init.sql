-- Create schemas for each microservice
CREATE SCHEMA IF NOT EXISTS auth_schema;
CREATE SCHEMA IF NOT EXISTS user_schema;
CREATE SCHEMA IF NOT EXISTS loan_schema;
CREATE SCHEMA IF NOT EXISTS emi_schema;
CREATE SCHEMA IF NOT EXISTS payment_schema;
CREATE SCHEMA IF NOT EXISTS admin_schema;
CREATE SCHEMA IF NOT EXISTS notification_schema;
CREATE SCHEMA IF NOT EXISTS external_schema;

-- Optional: Create a generic audit table in each schema (example)
-- This can be expanded as per service needs

-- Auth Schema Tables
CREATE TABLE IF NOT EXISTS auth_schema.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON auth_schema.users(email);

-- External Schema Tables
CREATE TABLE IF NOT EXISTS external_schema.verification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    verification_type VARCHAR(50) NOT NULL, -- PAN, AADHAAR, BANK
    id_number VARCHAR(100),
    status VARCHAR(50) NOT NULL, -- PENDING, SUCCESS, FAILED
    provider VARCHAR(50),
    provider_reference VARCHAR(255),
    request_payload JSONB,
    response_payload JSONB,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS external_schema.payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    order_id VARCHAR(100) UNIQUE NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    status VARCHAR(50) NOT NULL, -- PENDING, SUCCESS, FAILED, CANCELLED
    payment_session_id VARCHAR(255),
    payment_url TEXT,
    provider VARCHAR(50),
    provider_reference VARCHAR(255),
    callback_payload JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_verification_user_id ON external_schema.verification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_order_id ON external_schema.payment_transactions(order_id);

