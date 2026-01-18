#!/bin/bash

# =============================================================================
# GENESIS ENGINE - BACKUP SCRIPT
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Load environment variables
if [ -f "$PROJECT_DIR/.env" ]; then
    source "$PROJECT_DIR/.env"
fi

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/opt/genesis/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="genesis_backup_${TIMESTAMP}"

# Database configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-genesis_db}"
DB_USER="${DB_USER:-genesis_user}"
DB_PASSWORD="${DB_PASSWORD:-genesis_password}"

# Neo4j configuration
NEO4J_HOST="${NEO4J_HOST:-localhost}"
NEO4J_PORT="${NEO4J_PORT:-7687}"
NEO4J_USER="${NEO4J_USER:-neo4j}"
NEO4J_PASSWORD="${NEO4J_PASSWORD:-genesis_password}"

# Redis configuration
REDIS_HOST="${REDIS_HOST:-localhost}"
REDIS_PORT="${REDIS_PORT:-6379}"
REDIS_PASSWORD="${REDIS_PASSWORD:-}"

# S3 configuration
S3_BUCKET="${BACKUP_S3_BUCKET:-genesis-backups}"
S3_REGION="${AWS_REGION:-us-east-1}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Create backup directory
create_backup_dir() {
    log_info "Creating backup directory: $BACKUP_DIR"
    mkdir -p "$BACKUP_DIR"
    chmod 755 "$BACKUP_DIR"
}

# Backup PostgreSQL database
backup_postgres() {
    log_info "Starting PostgreSQL backup..."

    local backup_file="$BACKUP_DIR/${BACKUP_NAME}_postgres.sql.gz"

    # Export password for pg_dump
    export PGPASSWORD="$DB_PASSWORD"

    # Create backup
    if pg_dump \
        --host="$DB_HOST" \
        --port="$DB_PORT" \
        --username="$DB_USER" \
        --dbname="$DB_NAME" \
        --no-password \
        --format=custom \
        --compress=9 \
        --verbose \
        --file="$backup_file" \
        --exclude-schema=pg_* \
        --exclude-table=audit_logs; then

        log_success "PostgreSQL backup completed: $backup_file"
        echo "$backup_file"
    else
        log_error "PostgreSQL backup failed"
        return 1
    fi
}

# Backup Neo4j database
backup_neo4j() {
    log_info "Starting Neo4j backup..."

    local backup_file="$BACKUP_DIR/${BACKUP_NAME}_neo4j.dump"

    # Use neo4j-admin for backup
    if docker exec genesis-neo4j neo4j-admin database dump neo4j --to-path=/backups --overwrite-destination; then
        # Copy from container
        docker cp "genesis-neo4j:/backups/neo4j.dump" "$backup_file"

        # Compress
        gzip "$backup_file"
        backup_file="${backup_file}.gz"

        log_success "Neo4j backup completed: $backup_file"
        echo "$backup_file"
    else
        log_error "Neo4j backup failed"
        return 1
    fi
}

# Backup Redis data
backup_redis() {
    log_info "Starting Redis backup..."

    local backup_file="$BACKUP_DIR/${BACKUP_NAME}_redis.rdb"

    # Trigger Redis BGSAVE
    if redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" ${REDIS_PASSWORD:+ -a "$REDIS_PASSWORD"} BGSAVE; then
        # Wait for save to complete
        sleep 5

        # Copy Redis dump file (if running in Docker)
        if docker ps | grep -q genesis-redis; then
            docker cp "genesis-redis:/data/dump.rdb" "$backup_file"
        else
            # Copy from local Redis data directory
            cp /var/lib/redis/dump.rdb "$backup_file" 2>/dev/null || cp /usr/local/var/db/redis/dump.rdb "$backup_file" 2>/dev/null || true
        fi

        if [ -f "$backup_file" ]; then
            # Compress
            gzip "$backup_file"
            backup_file="${backup_file}.gz"

            log_success "Redis backup completed: $backup_file"
            echo "$backup_file"
        else
            log_warn "Redis dump file not found, skipping Redis backup"
            echo ""
        fi
    else
        log_error "Redis backup failed"
        return 1
    fi
}

# Backup application files and configuration
backup_application() {
    log_info "Starting application backup..."

    local backup_file="$BACKUP_DIR/${BACKUP_NAME}_application.tar.gz"

    # Create temporary directory for application files
    local temp_dir=$(mktemp -d)
    local app_dir="$temp_dir/application"

    mkdir -p "$app_dir"

    # Copy important application files (excluding node_modules, logs, etc.)
    rsync -av \
        --exclude='node_modules' \
        --exclude='*.log' \
        --exclude='.git' \
        --exclude='coverage' \
        --exclude='.next' \
        --exclude='dist' \
        --exclude='build' \
        "$PROJECT_DIR/" \
        "$app_dir/"

    # Create compressed archive
    if tar -czf "$backup_file" -C "$temp_dir" application/; then
        # Cleanup
        rm -rf "$temp_dir"

        log_success "Application backup completed: $backup_file"
        echo "$backup_file"
    else
        rm -rf "$temp_dir"
        log_error "Application backup failed"
        return 1
    fi
}

# Upload backup to S3
upload_to_s3() {
    local file_path="$1"
    local file_name=$(basename "$file_path")

    if [ -n "$S3_BUCKET" ] && command -v aws &> /dev/null; then
        log_info "Uploading $file_name to S3..."

        if aws s3 cp "$file_path" "s3://$S3_BUCKET/backups/$file_name" --region "$S3_REGION"; then
            log_success "Uploaded $file_name to S3"

            # Remove local file after successful upload
            rm -f "$file_path"
            log_info "Removed local backup file: $file_path"
        else
            log_error "Failed to upload $file_name to S3"
        fi
    else
        log_warn "S3 upload skipped (bucket not configured or AWS CLI not available)"
    fi
}

# Clean up old backups
cleanup_old_backups() {
    log_info "Cleaning up backups older than $RETENTION_DAYS days..."

    # Remove local old backups
    find "$BACKUP_DIR" -name "*.gz" -type f -mtime +$RETENTION_DAYS -exec rm -f {} \; -exec echo "Removed old backup: {}" \;

    # Remove old backups from S3
    if [ -n "$S3_BUCKET" ] && command -v aws &> /dev/null; then
        log_info "Cleaning up old backups from S3..."

        # List and delete old objects
        aws s3api list-objects-v2 \
            --bucket "$S3_BUCKET" \
            --prefix "backups/" \
            --query 'Contents[?LastModified<`'"$(date -d "$RETENTION_DAYS days ago" +%Y-%m-%d)"'`].Key' \
            --output text \
            --region "$S3_REGION" | \
        while read -r key; do
            if [ -n "$key" ]; then
                aws s3 rm "s3://$S3_BUCKET/$key" --region "$S3_REGION"
                echo "Removed old S3 backup: $key"
            fi
        done
    fi

    log_success "Cleanup completed"
}

# Send notification
send_notification() {
    local status="$1"
    local message="$2"

    log_info "Sending notification: $status - $message"

    # Send email notification if configured
    if [ -n "$NOTIFICATION_EMAIL" ] && command -v mail &> /dev/null; then
        echo "Genesis Engine Backup $status: $message" | mail -s "Genesis Engine Backup $status" "$NOTIFICATION_EMAIL"
    fi

    # Send Slack notification if configured
    if [ -n "$SLACK_WEBHOOK" ] && command -v curl &> /dev/null; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"Genesis Engine Backup $status: $message\"}" \
            "$SLACK_WEBHOOK"
    fi
}

# Main backup function
main() {
    log_info "Starting Genesis Engine backup process..."
    log_info "Backup name: $BACKUP_NAME"
    log_info "Backup directory: $BACKUP_DIR"

    local backup_files=()
    local failed_components=()

    # Create backup directory
    create_backup_dir

    # Perform backups
    local postgres_backup=$(backup_postgres)
    if [ $? -eq 0 ] && [ -n "$postgres_backup" ]; then
        backup_files+=("$postgres_backup")
    else
        failed_components+=("PostgreSQL")
    fi

    local neo4j_backup=$(backup_neo4j)
    if [ $? -eq 0 ] && [ -n "$neo4j_backup" ]; then
        backup_files+=("$neo4j_backup")
    else
        failed_components+=("Neo4j")
    fi

    local redis_backup=$(backup_redis)
    if [ $? -eq 0 ] && [ -n "$redis_backup" ]; then
        backup_files+=("$redis_backup")
    else
        failed_components+=("Redis")
    fi

    local app_backup=$(backup_application)
    if [ $? -eq 0 ] && [ -n "$app_backup" ]; then
        backup_files+=("$app_backup")
    else
        failed_components+=("Application")
    fi

    # Upload backups to S3
    for backup_file in "${backup_files[@]}"; do
        upload_to_s3 "$backup_file"
    done

    # Cleanup old backups
    cleanup_old_backups

    # Summary
    log_info "Backup summary:"
    log_info "  Total backups created: ${#backup_files[@]}"
    log_info "  Failed components: ${#failed_components[@]}"

    if [ ${#failed_components[@]} -eq 0 ]; then
        log_success "All backups completed successfully!"
        send_notification "SUCCESS" "All backups completed successfully. Files: ${#backup_files[@]}"
        exit 0
    else
        log_error "Some backups failed: ${failed_components[*]}"
        send_notification "PARTIAL" "Some backups failed: ${failed_components[*]}. Successful: ${#backup_files[@]}"
        exit 1
    fi
}

# Health check function
health_check() {
    log_info "Performing pre-backup health checks..."

    # Check database connectivity
    if ! pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1; then
        log_error "PostgreSQL is not accessible"
        return 1
    fi

    # Check Neo4j connectivity (if running in Docker)
    if docker ps | grep -q genesis-neo4j; then
        if ! docker exec genesis-neo4j cypher-shell -u "$NEO4J_USER" -p "$NEO4J_PASSWORD" "MATCH () RETURN count(*) limit 1" >/dev/null 2>&1; then
            log_error "Neo4j is not accessible"
            return 1
        fi
    fi

    # Check Redis connectivity
    if ! redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" ${REDIS_PASSWORD:+ -a "$REDIS_PASSWORD"} ping >/dev/null 2>&1; then
        log_error "Redis is not accessible"
        return 1
    fi

    log_success "All services are accessible"
    return 0
}

# Parse command line arguments
case "${1:-}" in
    "health-check")
        health_check
        ;;
    "cleanup")
        cleanup_old_backups
        ;;
    *)
        # Run health check before backup
        if health_check; then
            main
        else
            log_error "Health check failed, aborting backup"
            send_notification "FAILED" "Health check failed, backup aborted"
            exit 1
        fi
        ;;
esac