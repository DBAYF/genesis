-- =============================================================================
-- GENESIS ENGINE - DATABASE PERFORMANCE OPTIMIZATION
-- =============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
CREATE EXTENSION IF NOT EXISTS pg_buffercache;
CREATE EXTENSION IF NOT EXISTS pg_prewarm;

-- =============================================================================
-- MEMORY CONFIGURATION
-- =============================================================================

-- Shared buffers (25% of RAM)
ALTER SYSTEM SET shared_buffers = '2GB';

-- Work memory (per connection, for sorts/hashes)
ALTER SYSTEM SET work_mem = '64MB';

-- Maintenance work memory (for VACUUM, CREATE INDEX, etc.)
ALTER SYSTEM SET maintenance_work_mem = '512MB';

-- Effective cache size (shared buffers + OS cache)
ALTER SYSTEM SET effective_cache_size = '6GB';

-- =============================================================================
-- CHECKPOINT CONFIGURATION
-- =============================================================================

-- Checkpoint segments (WAL segments between checkpoints)
ALTER SYSTEM SET checkpoint_segments = 32;

-- Checkpoint completion target (spread checkpoints over time)
ALTER SYSTEM SET checkpoint_completion_target = 0.9;

-- WAL buffers
ALTER SYSTEM SET wal_buffers = '16MB';

-- =============================================================================
-- CONNECTION CONFIGURATION
-- =============================================================================

-- Maximum connections
ALTER SYSTEM SET max_connections = 200;

-- =============================================================================
-- QUERY PLANNING
-- =============================================================================

-- Random page cost (SSD optimization)
ALTER SYSTEM SET random_page_cost = 1.1;

-- Effective IO concurrency
ALTER SYSTEM SET effective_io_concurrency = 200;

-- =============================================================================
-- LOGGING CONFIGURATION
-- =============================================================================

-- Log slow queries (>1 second)
ALTER SYSTEM SET log_min_duration_statement = 1000;

-- Log checkpoints
ALTER SYSTEM SET log_checkpoints = on;

-- Log connections
ALTER SYSTEM SET log_connections = on;

-- Log disconnections
ALTER SYSTEM SET log_disconnections = on;

-- =============================================================================
-- AUTOVACUUM CONFIGURATION
-- =============================================================================

-- Enable autovacuum
ALTER SYSTEM SET autovacuum = on;

-- Autovacuum max workers
ALTER SYSTEM SET autovacuum_max_workers = 6;

-- Autovacuum naptime
ALTER SYSTEM SET autovacuum_naptime = '20s';

-- Autovacuum vacuum scale factor
ALTER SYSTEM SET autovacuum_vacuum_scale_factor = 0.02;

-- Autovacuum analyze scale factor
ALTER SYSTEM SET autovacuum_analyze_scale_factor = 0.01;

-- =============================================================================
-- INDEX OPTIMIZATION
-- =============================================================================

-- Create indexes for frequently queried columns

-- Users table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_status ON users(status);

-- Companies table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_companies_name ON companies(name);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_companies_type ON companies(type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_companies_status ON companies(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_companies_created_at ON companies(created_at);

-- Company members indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_company_members_company_id ON company_members(company_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_company_members_user_id ON company_members(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_company_members_role ON company_members(role);

-- Financial projections indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_financial_projections_company_id ON financial_projections(company_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_financial_projections_type ON financial_projections(type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_financial_projections_created_at ON financial_projections(created_at);

-- Transactions indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_company_id ON transactions(company_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

-- Compliance tasks indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_compliance_tasks_company_id ON compliance_tasks(company_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_compliance_tasks_status ON compliance_tasks(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_compliance_tasks_due_date ON compliance_tasks(due_date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_compliance_tasks_created_at ON compliance_tasks(created_at);

-- CRM contacts indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_crm_contacts_company_id ON crm_contacts(company_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_crm_contacts_type ON crm_contacts(type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_crm_contacts_email ON crm_contacts(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_crm_contacts_created_at ON crm_contacts(created_at);

-- CRM deals indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_crm_deals_company_id ON crm_deals(company_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_crm_deals_contact_id ON crm_deals(contact_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_crm_deals_status ON crm_deals(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_crm_deals_created_at ON crm_deals(created_at);

-- Calendar events indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_calendar_events_company_id ON calendar_events(company_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_calendar_events_start_time ON calendar_events(start_time);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_calendar_events_end_time ON calendar_events(end_time);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_calendar_events_created_at ON calendar_events(created_at);

-- Messages indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Audit logs indexes (for compliance)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- =============================================================================
-- PARTITIONING STRATEGY
-- =============================================================================

-- Partition large tables by time for better performance

-- Partition audit_logs by month
CREATE TABLE IF NOT EXISTS audit_logs_y2024m01 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE IF NOT EXISTS audit_logs_y2024m02 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

-- Partition transactions by quarter
CREATE TABLE IF NOT EXISTS transactions_y2024q1 PARTITION OF transactions
    FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');

CREATE TABLE IF NOT EXISTS transactions_y2024q2 PARTITION OF transactions
    FOR VALUES FROM ('2024-04-01') TO ('2024-07-01');

-- Partition messages by month
CREATE TABLE IF NOT EXISTS messages_y2024m01 PARTITION OF messages
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- =============================================================================
-- QUERY OPTIMIZATION
-- =============================================================================

-- Create materialized views for expensive queries

-- Company financial summary
CREATE MATERIALIZED VIEW IF NOT EXISTS company_financial_summary AS
SELECT
    c.id as company_id,
    c.name as company_name,
    COUNT(DISTINCT fp.id) as projection_count,
    SUM(t.amount) as total_transactions,
    AVG(t.amount) as avg_transaction_amount,
    MAX(t.date) as last_transaction_date,
    COUNT(DISTINCT ct.id) as compliance_tasks,
    COUNT(DISTINCT CASE WHEN ct.status = 'completed' THEN ct.id END) as completed_tasks
FROM companies c
LEFT JOIN financial_projections fp ON c.id = fp.company_id
LEFT JOIN transactions t ON c.id = t.company_id
LEFT JOIN compliance_tasks ct ON c.id = ct.company_id
GROUP BY c.id, c.name;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_company_financial_summary_company_id ON company_financial_summary(company_id);

-- CRM performance metrics
CREATE MATERIALIZED VIEW IF NOT EXISTS crm_performance_metrics AS
SELECT
    c.id as company_id,
    c.name as company_name,
    COUNT(DISTINCT contacts.id) as total_contacts,
    COUNT(DISTINCT deals.id) as total_deals,
    SUM(deals.value) as total_deal_value,
    AVG(deals.value) as avg_deal_value,
    COUNT(DISTINCT CASE WHEN deals.status = 'won' THEN deals.id END) as won_deals,
    COUNT(DISTINCT CASE WHEN deals.status = 'lost' THEN deals.id END) as lost_deals
FROM companies c
LEFT JOIN crm_contacts contacts ON c.id = contacts.company_id
LEFT JOIN crm_deals deals ON c.id = deals.company_id
GROUP BY c.id, c.name;

-- =============================================================================
-- CACHING STRATEGY
-- =============================================================================

-- Create partial indexes for common queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_active_companies ON companies(status) WHERE status = 'active';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pending_compliance_tasks ON compliance_tasks(status) WHERE status = 'pending';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_open_deals ON crm_deals(status) WHERE status IN ('proposal', 'negotiation', 'review');

-- =============================================================================
-- MAINTENANCE SCRIPTS
-- =============================================================================

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY company_financial_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY crm_performance_metrics;
END;
$$ LANGUAGE plpgsql;

-- Function to update table statistics
CREATE OR REPLACE FUNCTION update_table_statistics()
RETURNS void AS $$
BEGIN
    ANALYZE VERBOSE;
END;
$$ LANGUAGE plpgsql;

-- Create maintenance job (run daily)
-- This would be scheduled via cron or pg_cron extension
-- SELECT cron.schedule('daily-maintenance', '0 2 * * *', 'SELECT refresh_materialized_views(); SELECT update_table_statistics();');

-- =============================================================================
-- MONITORING QUERIES
-- =============================================================================

-- Query to monitor slow queries
CREATE OR REPLACE VIEW slow_queries AS
SELECT
    query,
    calls,
    total_time,
    mean_time,
    rows,
    shared_blks_hit,
    shared_blks_read,
    temp_blks_written
FROM pg_stat_statements
WHERE mean_time > 1000  -- Queries taking more than 1 second on average
ORDER BY mean_time DESC
LIMIT 20;

-- Query to monitor table bloat
CREATE OR REPLACE VIEW table_bloat AS
SELECT
    schemaname,
    tablename,
    n_tup_ins - n_tup_del as est_rows,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_stat_user_tables
WHERE n_tup_ins - n_tup_del > 1000
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- =============================================================================
-- RELOAD CONFIGURATION
-- =============================================================================

-- Reload PostgreSQL configuration
SELECT pg_reload_conf();