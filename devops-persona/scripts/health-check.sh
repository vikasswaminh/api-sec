#!/bin/bash
# Daily Health Check Script for LLM-FW
# Run this via cron: 0 * * * * /path/to/health-check.sh

set -e

# Configuration
API_URL="${API_URL:-https://llm-fw-edge.your-subdomain.workers.dev}"
ALERT_WEBHOOK="${SLACK_WEBHOOK_URL}"
EMAIL="${ALERT_EMAIL:-ops@yourdomain.com}"
LOG_FILE="/var/log/llm-fw-health.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

alert() {
    local severity="$1"
    local message="$2"
    
    log "[$severity] $message"
    
    # Send to Slack if configured
    if [ -n "$ALERT_WEBHOOK" ]; then
        local color="good"
        [ "$severity" = "WARNING" ] && color="warning"
        [ "$severity" = "CRITICAL" ] && color="danger"
        
        curl -s -X POST "$ALERT_WEBHOOK" \
            -H 'Content-Type: application/json' \
            -d "{
                \"attachments\": [{
                    \"color\": \"$color\",
                    \"title\": \"LLM-FW Health Check: $severity\",
                    \"text\": \"$message\",
                    \"footer\": \"CF-Worker Health Check\",
                    \"ts\": $(date +%s)
                }]
            }" > /dev/null || true
    fi
}

# Test 1: Health endpoint
test_health() {
    log "Testing health endpoint..."
    
    if ! RESPONSE=$(curl -sf "$API_URL/health" 2>&1); then
        alert "CRITICAL" "Health endpoint failed: $RESPONSE"
        return 1
    fi
    
    if ! echo "$RESPONSE" | jq -e '.status == "healthy"' > /dev/null 2>&1; then
        alert "WARNING" "Health endpoint returned unexpected response: $RESPONSE"
        return 1
    fi
    
    log "${GREEN}✓${NC} Health endpoint OK"
    return 0
}

# Test 2: Auth working (should reject invalid key)
test_auth() {
    log "Testing authentication..."
    
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "X-API-Key: invalid-key-for-testing" \
        "$API_URL/v1/stats" 2>&1)
    
    if [ "$HTTP_CODE" != "401" ]; then
        alert "CRITICAL" "Auth bypass possible! Expected 401, got $HTTP_CODE"
        return 1
    fi
    
    log "${GREEN}✓${NC} Authentication working"
    return 0
}

# Main execution
main() {
    log "=========================================="
    log "Starting LLM-FW Health Check"
    log "=========================================="
    
    FAILED=0
    
    test_health || FAILED=$((FAILED + 1))
    test_auth || FAILED=$((FAILED + 1))
    
    log "=========================================="
    if [ $FAILED -eq 0 ]; then
        log "${GREEN}✓ All checks passed${NC}"
        exit 0
    else
        log "${RED}✗ $FAILED check(s) failed${NC}"
        exit 1
    fi
}

main "$@"
