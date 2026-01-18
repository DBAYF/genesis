-- ============================================================================
-- GENESIS ENGINE - INITIAL DATABASE MIGRATION
-- ============================================================================
-- This migration creates all the core tables for the Genesis Engine platform
-- Run this against a PostgreSQL 16.x database
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";      -- Fuzzy text search
CREATE EXTENSION IF NOT EXISTS "btree_gin";    -- GIN indexes

-- ============================================================================
-- USERS & AUTHENTICATION
-- ============================================================================

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    email_verified BOOLEAN DEFAULT FALSE,
    phone VARCHAR(20),
    phone_verified BOOLEAN DEFAULT FALSE,
    password_hash VARCHAR(255),  -- NULL for OAuth-only users
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    timezone VARCHAR(50) DEFAULT 'Europe/London',
    locale VARCHAR(10) DEFAULT 'en-GB',

    -- Onboarding
    onboarding_completed BOOLEAN DEFAULT FALSE,
    onboarding_step VARCHAR(50),

    -- Pulse preferences
    pulse_enabled BOOLEAN DEFAULT TRUE,
    pulse_preferred_channel VARCHAR(20) DEFAULT 'whatsapp',
    pulse_active_hours_start TIME DEFAULT '08:00',
    pulse_active_hours_end TIME DEFAULT '22:00',
    pulse_digest_time TIME DEFAULT '07:00',

    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
    last_active_at TIMESTAMPTZ,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- User authentication methods
CREATE TABLE user_auth_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,  -- 'email', 'google', 'apple', 'linkedin'
    provider_user_id VARCHAR(255),
    access_token_encrypted TEXT,
    refresh_token_encrypted TEXT,
    token_expires_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(provider, provider_user_id)
);

-- Sessions
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    device_info JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    last_used_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- COMPANIES & STRUCTURE
-- ============================================================================

-- Companies table
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Basic Info
    name VARCHAR(255) NOT NULL,
    trading_name VARCHAR(255),
    company_number VARCHAR(20) UNIQUE,  -- Companies House number

    -- Type & Structure
    company_type VARCHAR(50) DEFAULT 'ltd' CHECK (company_type IN (
        'ltd', 'plc', 'llp', 'partnership', 'sole_trader', 'cic', 'charity'
    )),
    company_status VARCHAR(30) DEFAULT 'pre_incorporation' CHECK (company_status IN (
        'pre_incorporation', 'active', 'dormant', 'dissolved', 'liquidation'
    )),

    -- Dates
    incorporation_date DATE,
    accounting_reference_date DATE,  -- Year end day/month
    first_accounts_due DATE,
    next_accounts_due DATE,
    next_confirmation_statement_due DATE,

    -- Registered Office
    registered_address_line1 VARCHAR(255),
    registered_address_line2 VARCHAR(255),
    registered_address_city VARCHAR(100),
    registered_address_county VARCHAR(100),
    registered_address_postcode VARCHAR(20),
    registered_address_country VARCHAR(2) DEFAULT 'GB',

    -- Business Address (if different)
    business_address_line1 VARCHAR(255),
    business_address_line2 VARCHAR(255),
    business_address_city VARCHAR(100),
    business_address_county VARCHAR(100),
    business_address_postcode VARCHAR(20),
    business_address_country VARCHAR(2) DEFAULT 'GB',

    -- Classification
    sic_codes VARCHAR(5)[] DEFAULT '{}',
    nature_of_business TEXT,
    industry VARCHAR(100),
    sector VARCHAR(100),

    -- Tax & Compliance
    corporation_tax_reference VARCHAR(20),
    vat_number VARCHAR(20),
    vat_registered BOOLEAN DEFAULT FALSE,
    paye_reference VARCHAR(20),
    paye_registered BOOLEAN DEFAULT FALSE,

    -- SEIS/EIS
    seis_eligible BOOLEAN,
    seis_advance_assurance_status VARCHAR(30),
    seis_advance_assurance_date DATE,
    seis_allocation_remaining DECIMAL(12, 2) DEFAULT 150000,
    eis_eligible BOOLEAN,
    eis_advance_assurance_status VARCHAR(30),
    eis_advance_assurance_date DATE,

    -- Financials (snapshot)
    current_cash_balance DECIMAL(15, 2),
    monthly_burn_rate DECIMAL(15, 2),
    runway_months DECIMAL(5, 1),
    total_funding_raised DECIMAL(15, 2) DEFAULT 0,
    last_valuation DECIMAL(15, 2),
    last_valuation_date DATE,

    -- Settings
    default_currency VARCHAR(3) DEFAULT 'GBP',
    financial_year_end_month INTEGER DEFAULT 3 CHECK (financial_year_end_month BETWEEN 1 AND 12),

    -- Knowledge Graph
    knowledge_graph_id VARCHAR(100),  -- Neo4j node ID

    -- Metadata
    metadata JSONB DEFAULT '{}',

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Company-User relationship (roles)
CREATE TABLE company_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN (
        'owner', 'admin', 'member', 'viewer', 'advisor', 'investor'
    )),
    title VARCHAR(100),  -- e.g., "CEO", "CTO"
    is_founder BOOLEAN DEFAULT FALSE,
    is_director BOOLEAN DEFAULT FALSE,
    is_shareholder BOOLEAN DEFAULT FALSE,
    shareholding_percentage DECIMAL(5, 2),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    invited_by UUID REFERENCES users(id),
    invite_accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(company_id, user_id)
);

-- ============================================================================
-- OFFICERS & SHAREHOLDERS
-- ============================================================================

-- Officers
CREATE TABLE officers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),  -- NULL if external person

    -- Officer Type
    officer_type VARCHAR(30) NOT NULL CHECK (officer_type IN (
        'director', 'secretary', 'member', 'llp_member', 'psc'
    )),
    officer_role VARCHAR(50),  -- e.g., "Managing Director"

    -- Personal Details
    title VARCHAR(20),
    first_name VARCHAR(100) NOT NULL,
    middle_names VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    former_names JSONB DEFAULT '[]',
    date_of_birth DATE,
    nationality VARCHAR(100),
    occupation VARCHAR(100),

    -- Address
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    address_city VARCHAR(100),
    address_county VARCHAR(100),
    address_postcode VARCHAR(20),
    address_country VARCHAR(2),

    -- Service Address (if different)
    service_address_line1 VARCHAR(255),
    service_address_line2 VARCHAR(255),
    service_address_city VARCHAR(100),
    service_address_postcode VARCHAR(20),
    service_address_country VARCHAR(2),

    -- Appointment
    appointed_on DATE,
    resigned_on DATE,

    -- Companies House
    companies_house_id VARCHAR(50),

    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'resigned', 'removed')),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shareholders
CREATE TABLE shareholders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),  -- NULL if external

    -- Entity Type
    shareholder_type VARCHAR(30) NOT NULL CHECK (shareholder_type IN (
        'individual', 'company', 'trust', 'nominee'
    )),

    -- For individuals
    title VARCHAR(20),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    date_of_birth DATE,

    -- For companies
    company_name VARCHAR(255),
    company_number VARCHAR(20),
    company_jurisdiction VARCHAR(100),

    -- Address
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    address_city VARCHAR(100),
    address_postcode VARCHAR(20),
    address_country VARCHAR(2),

    -- Contact
    email VARCHAR(255),
    phone VARCHAR(20),

    -- Classification
    investor_type VARCHAR(50),  -- 'founder', 'angel', 'vc', 'employee', 'other'

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SHARE CAPITAL
-- ============================================================================

-- Share Classes
CREATE TABLE share_classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    class_name VARCHAR(50) NOT NULL,  -- 'Ordinary', 'Preference A', etc.
    class_code VARCHAR(10) NOT NULL,  -- 'ORD', 'PREF-A', etc.

    -- Rights
    voting_rights BOOLEAN DEFAULT TRUE,
    dividend_rights BOOLEAN DEFAULT TRUE,
    liquidation_rights BOOLEAN DEFAULT TRUE,
    conversion_rights BOOLEAN DEFAULT FALSE,
    redemption_rights BOOLEAN DEFAULT FALSE,

    -- Terms
    par_value DECIMAL(10, 4) DEFAULT 0.01,
    dividend_rate DECIMAL(5, 2), -- For preference shares
    liquidation_preference DECIMAL(10, 2),
    conversion_ratio DECIMAL(10, 4),
    redemption_price DECIMAL(10, 2),

    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled')),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shareholdings
CREATE TABLE shareholdings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    shareholder_id UUID NOT NULL REFERENCES shareholders(id) ON DELETE CASCADE,
    share_class_id UUID NOT NULL REFERENCES share_classes(id) ON DELETE CASCADE,

    -- Share details
    number_of_shares INTEGER NOT NULL,
    percentage DECIMAL(5, 2) NOT NULL,
    acquired_date DATE NOT NULL,
    acquisition_price DECIMAL(10, 4), -- Price per share
    total_cost DECIMAL(15, 2),

    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'transferred', 'cancelled')),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- DOCUMENTS
-- ============================================================================

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    -- Document info
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,  -- 'incorporation', 'accounts', 'confirmation_statement', 'contract', 'pitch_deck', etc.
    category VARCHAR(50) NOT NULL,  -- 'legal', 'financial', 'operational', 'marketing'

    -- File details
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size INTEGER NOT NULL,
    storage_path TEXT NOT NULL,
    storage_bucket VARCHAR(100),

    -- Document metadata
    description TEXT,
    tags VARCHAR(50)[] DEFAULT '{}',
    version INTEGER DEFAULT 1,
    is_latest BOOLEAN DEFAULT TRUE,

    -- Legal/Compliance
    is_executed BOOLEAN DEFAULT FALSE,
    executed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    requires_renewal BOOLEAN DEFAULT FALSE,

    -- External integrations
    companies_house_id VARCHAR(50),
    hmrc_id VARCHAR(50),

    -- Audit
    uploaded_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TASKS & WORKFLOW
-- ============================================================================

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    -- Task details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,  -- 'onboarding', 'compliance', 'financial', 'legal', 'operational'
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),

    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    progress INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),

    -- Dates
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- Assignment
    assigned_to UUID REFERENCES users(id),
    assigned_by UUID REFERENCES users(id),

    -- Dependencies
    depends_on UUID[] DEFAULT '{}', -- Task IDs this depends on
    blocking UUID[] DEFAULT '{}', -- Task IDs this blocks

    -- Automation
    is_automated BOOLEAN DEFAULT FALSE,
    automation_trigger VARCHAR(100),
    automation_action VARCHAR(100),

    -- Metadata
    metadata JSONB DEFAULT '{}',

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- COMPLIANCE
-- ============================================================================

CREATE TABLE compliance_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),

    -- Task details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,  -- 'accounts', 'confirmation_statement', 'vat', 'paye', 'corporation_tax'
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),

    -- Status & dates
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue', 'cancelled')),
    due_date TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    snoozed_until TIMESTAMPTZ,

    -- External references
    companies_house_id VARCHAR(50),
    hmrc_id VARCHAR(50),

    -- Automation
    is_automated BOOLEAN DEFAULT FALSE,
    automation_type VARCHAR(50),  -- 'companies_house_filing', 'hmrc_submission', 'reminder'

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE compliance_deadlines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    -- Deadline details
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,  -- 'accounts', 'confirmation_statement', 'vat', 'paye', 'corporation_tax'
    frequency VARCHAR(20) NOT NULL,  -- 'annual', 'quarterly', 'monthly', 'one_time'

    -- Dates
    due_date TIMESTAMPTZ NOT NULL,
    next_due_date TIMESTAMPTZ,
    last_completed_at TIMESTAMPTZ,

    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),

    -- External integration
    companies_house_id VARCHAR(50),
    hmrc_id VARCHAR(50),

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- FINANCIAL
-- ============================================================================

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    -- Transaction details
    date TIMESTAMPTZ NOT NULL,
    description VARCHAR(500) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'GBP',

    -- Classification
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense', 'transfer', 'investment', 'dividend')),
    category VARCHAR(100) NOT NULL,  -- 'revenue', 'cost_of_sales', 'operating_expenses', 'capital_expenditure', etc.
    subcategory VARCHAR(100),

    -- VAT
    is_vatable BOOLEAN DEFAULT TRUE,
    vat_rate DECIMAL(5, 2),
    vat_amount DECIMAL(15, 2),

    -- Bank reconciliation
    bank_account_id VARCHAR(100),
    bank_transaction_id VARCHAR(100),
    reconciled_at TIMESTAMPTZ,
    reconciled_by UUID REFERENCES users(id),

    -- External integrations
    quickbooks_id VARCHAR(100),
    xero_id VARCHAR(100),
    stripe_id VARCHAR(100),

    -- Documents
    receipt_url TEXT,
    invoice_url TEXT,

    -- Audit
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PULSE (MESSAGING)
-- ============================================================================

CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Conversation details
    title VARCHAR(255),
    channel VARCHAR(20) NOT NULL,  -- 'sms', 'whatsapp', 'telegram', 'email'
    channel_identifier VARCHAR(255) NOT NULL,  -- phone number, email, etc.
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'closed')),

    -- Participants
    participants JSONB DEFAULT '[]', -- For group conversations

    -- Last activity
    last_message_at TIMESTAMPTZ,
    last_message_preview VARCHAR(500),

    -- Settings
    is_muted BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,

    -- AI features
    ai_enabled BOOLEAN DEFAULT TRUE,
    ai_personality VARCHAR(50),  -- 'professional', 'casual', 'expert'

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),

    -- Message content
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('inbound', 'outbound')),

    -- Media attachments
    attachments JSONB DEFAULT '[]',

    -- Status
    status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sending', 'sent', 'delivered', 'read', 'failed')),
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,

    -- AI processing
    ai_processed BOOLEAN DEFAULT FALSE,
    ai_intent VARCHAR(50),
    ai_confidence DECIMAL(3, 2),
    ai_response TEXT,

    -- External references
    external_id VARCHAR(100),  -- Twilio SID, etc.
    external_metadata JSONB DEFAULT '{}',

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- NEXUS (NETWORKING & FUNDING)
-- ============================================================================

CREATE TABLE investor_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id),

    -- Profile details
    bio TEXT,
    linkedin_url VARCHAR(500),
    website_url VARCHAR(500),

    -- Investment focus
    investment_focus VARCHAR(100)[] DEFAULT '{}',
    investment_stages VARCHAR(50)[] DEFAULT '{}', -- 'pre_seed', 'seed', 'series_a', etc.
    investment_range JSONB DEFAULT '{}', -- { min: number, max: number }

    -- Track record
    total_investments INTEGER DEFAULT 0,
    successful_exits INTEGER DEFAULT 0,
    portfolio_companies JSONB DEFAULT '[]',

    -- Preferences
    preferred_industries VARCHAR(100)[] DEFAULT '{}',
    preferred_locations VARCHAR(100)[] DEFAULT '{}',
    preferred_company_stages VARCHAR(50)[] DEFAULT '{}',

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    verification_status VARCHAR(20) DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified')),

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE introduction_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Parties
    requester_id UUID NOT NULL REFERENCES users(id),
    target_id UUID NOT NULL REFERENCES users(id),
    introducer_id UUID REFERENCES users(id),

    -- Context
    company_id UUID REFERENCES companies(id),
    introduction_type VARCHAR(50) NOT NULL,  -- 'investor', 'partner', 'advisor', 'customer'
    introduction_reason TEXT NOT NULL,

    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined', 'completed')),
    response_message TEXT,

    -- Dates
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    responded_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE funding_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),

    -- Application details
    funding_type VARCHAR(30) NOT NULL,  -- 'equity', 'debt', 'grant', 'convertible_note'
    funding_stage VARCHAR(30) NOT NULL,  -- 'pre_seed', 'seed', 'series_a', etc.
    amount_requested DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'GBP',

    -- Company info
    company_description TEXT NOT NULL,
    traction TEXT,
    market_size TEXT,
    competitive_advantage TEXT,

    -- Financials
    current_revenue DECIMAL(15, 2),
    projected_revenue DECIMAL(15, 2),
    current_burn_rate DECIMAL(15, 2),
    runway_months DECIMAL(5, 1),

    -- Use of funds
    use_of_funds JSONB DEFAULT '[]', -- Array of { category: string, amount: number, description: string }

    -- Documents
    pitch_deck_url TEXT,
    financial_model_url TEXT,
    business_plan_url TEXT,

    -- Status
    status VARCHAR(30) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'funded')),
    submitted_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    decision_at TIMESTAMPTZ,

    -- Investor matching
    matched_investors UUID[] DEFAULT '{}', -- Investor IDs
    ai_matching_score DECIMAL(3, 2),

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- GENESIS ENGINE CORE
-- ============================================================================

CREATE TABLE genesis_phases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    estimated_duration INTEGER NOT NULL, -- days

    -- Configuration
    is_active BOOLEAN DEFAULT TRUE,
    required_for_completion UUID[] DEFAULT '{}', -- Module IDs

    -- Metadata
    icon VARCHAR(50),
    color VARCHAR(20),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE genesis_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phase_id UUID NOT NULL REFERENCES genesis_phases(id) ON DELETE CASCADE,

    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(30) NOT NULL,  -- 'document', 'task', 'integration', 'review'
    order_index INTEGER NOT NULL,

    -- Configuration
    is_required BOOLEAN DEFAULT TRUE,
    is_automated BOOLEAN DEFAULT FALSE,
    estimated_duration INTEGER NOT NULL, -- minutes

    -- AI Configuration
    ai_prompt TEXT,
    ai_model VARCHAR(50),
    ai_temperature DECIMAL(3, 2),

    -- Status tracking
    completion_criteria JSONB DEFAULT '{}',

    -- Metadata
    icon VARCHAR(50),
    category VARCHAR(50),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE company_genesis_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    phase_id UUID NOT NULL REFERENCES genesis_phases(id),
    module_id UUID NOT NULL REFERENCES genesis_modules(id),

    -- Progress
    status VARCHAR(20) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'skipped')),
    progress INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- AI interactions
    ai_interactions JSONB DEFAULT '[]',
    ai_generated_content JSONB DEFAULT '{}',

    -- User interactions
    user_inputs JSONB DEFAULT '{}',
    user_feedback TEXT,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(company_id, phase_id, module_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_status ON users(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_email_trgm ON users USING gin(email gin_trgm_ops) WHERE deleted_at IS NULL;

-- User auth methods
CREATE INDEX idx_user_auth_methods_user ON user_auth_methods(user_id);

-- Sessions
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token_hash);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);

-- Companies
CREATE INDEX idx_companies_number ON companies(company_number) WHERE company_number IS NOT NULL;
CREATE INDEX idx_companies_status ON companies(company_status) WHERE deleted_at IS NULL;
CREATE INDEX idx_companies_name_trgm ON companies USING gin(name gin_trgm_ops) WHERE deleted_at IS NULL;
CREATE INDEX idx_companies_industry ON companies(industry) WHERE deleted_at IS NULL;

-- Company members
CREATE INDEX idx_company_members_company ON company_members(company_id);
CREATE INDEX idx_company_members_user ON company_members(user_id);
CREATE INDEX idx_company_members_role ON company_members(role);

-- Officers
CREATE INDEX idx_officers_company ON officers(company_id);
CREATE INDEX idx_officers_user ON officers(user_id) WHERE user_id IS NOT NULL;

-- Shareholders
CREATE INDEX idx_shareholders_company ON shareholders(company_id);
CREATE INDEX idx_shareholders_user ON shareholders(user_id) WHERE user_id IS NOT NULL;

-- Documents
CREATE INDEX idx_documents_company ON documents(company_id);
CREATE INDEX idx_documents_type ON documents(type);
CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);

-- Tasks
CREATE INDEX idx_tasks_company ON tasks(company_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date) WHERE status != 'completed';

-- Compliance tasks
CREATE INDEX idx_compliance_tasks_company ON compliance_tasks(company_id);
CREATE INDEX idx_compliance_tasks_user ON compliance_tasks(user_id);
CREATE INDEX idx_compliance_tasks_status ON compliance_tasks(status);
CREATE INDEX idx_compliance_tasks_due_date ON compliance_tasks(due_date);

-- Transactions
CREATE INDEX idx_transactions_company ON transactions(company_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_category ON transactions(category);

-- Conversations
CREATE INDEX idx_conversations_user ON conversations(user_id);
CREATE INDEX idx_conversations_channel ON conversations(channel);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);

-- Messages
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_user ON messages(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_messages_created ON messages(created_at DESC);
CREATE INDEX idx_messages_direction ON messages(direction);

-- Investor profiles
CREATE INDEX idx_investor_profiles_user ON investor_profiles(user_id);
CREATE INDEX idx_investor_profiles_company ON investor_profiles(company_id) WHERE company_id IS NOT NULL;
CREATE INDEX idx_investor_profiles_active ON investor_profiles(is_active) WHERE is_active = true;

-- Funding applications
CREATE INDEX idx_funding_applications_company ON funding_applications(company_id);
CREATE INDEX idx_funding_applications_user ON funding_applications(user_id);
CREATE INDEX idx_funding_applications_status ON funding_applications(status);
CREATE INDEX idx_funding_applications_submitted ON funding_applications(submitted_at) WHERE submitted_at IS NOT NULL;

-- Genesis phases/modules
CREATE INDEX idx_genesis_phases_order ON genesis_phases(order_index);
CREATE INDEX idx_genesis_modules_phase ON genesis_modules(phase_id);
CREATE INDEX idx_genesis_modules_order ON genesis_modules(phase_id, order_index);

-- Company genesis progress
CREATE INDEX idx_company_genesis_progress_company ON company_genesis_progress(company_id);
CREATE INDEX idx_company_genesis_progress_status ON company_genesis_progress(status);
CREATE INDEX idx_company_genesis_progress_phase_module ON company_genesis_progress(phase_id, module_id);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_auth_methods_updated_at BEFORE UPDATE ON user_auth_methods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_members_updated_at BEFORE UPDATE ON company_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_officers_updated_at BEFORE UPDATE ON officers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shareholders_updated_at BEFORE UPDATE ON shareholders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_share_classes_updated_at BEFORE UPDATE ON share_classes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shareholdings_updated_at BEFORE UPDATE ON shareholdings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_compliance_tasks_updated_at BEFORE UPDATE ON compliance_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_compliance_deadlines_updated_at BEFORE UPDATE ON compliance_deadlines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_investor_profiles_updated_at BEFORE UPDATE ON investor_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_funding_applications_updated_at BEFORE UPDATE ON funding_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_genesis_phases_updated_at BEFORE UPDATE ON genesis_phases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_genesis_modules_updated_at BEFORE UPDATE ON genesis_modules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_genesis_progress_updated_at BEFORE UPDATE ON company_genesis_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();