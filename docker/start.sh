#!/bin/sh
set -e

echo "Starting B9 Website Container..."
echo "Timestamp: $(date)"

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Function to validate numeric environment variables
validate_numeric() {
    local var_name="$1"
    local var_value="$2"
    local default_value="$3"
    
    if echo "$var_value" | grep -qE '^[0-9]+$'; then
        echo "$var_value"
    else
        log "Warning: $var_name value '$var_value' is not numeric, using default: $default_value"
        echo "$default_value"
    fi
}

# Environment variable validation and fallback
log "Validating environment configuration..."

# NODE_ENV validation
if [ -z "$NODE_ENV" ]; then
    export NODE_ENV=production
    log "NODE_ENV not set, using default: production"
else
    log "NODE_ENV: $NODE_ENV"
fi

# Port validation with fallback
# For Zeabur deployment, Zeabur provides PORT (e.g., 8080)
# We want Nginx to listen on Zeabur's PORT, but keep internal API on 3005
NGINX_LISTEN_PORT=${PORT:-80}
API_PORT=3005
export API_PORT

# Upload path validation
if [ -n "$UPLOAD_PATH" ]; then
    export UPLOAD_PATH
elif [ -n "$UPLOAD_DIR" ]; then
    export UPLOAD_PATH="$UPLOAD_DIR"
else
    export UPLOAD_PATH=/app/uploads
    log "No upload path specified, using default: /app/uploads"
fi

# Config path validation
if [ -n "$CONFIG_PATH" ]; then
    export CONFIG_PATH
elif [ -n "$CONFIG_DIR" ]; then
    export CONFIG_PATH="$CONFIG_DIR"
else
    export CONFIG_PATH=/app/data
    log "No config path specified, using default: /app/data"
fi

# File size validation
if [ -n "$MAX_FILE_SIZE" ]; then
    MAX_FILE_SIZE=$(validate_numeric "MAX_FILE_SIZE" "$MAX_FILE_SIZE" "10485760")
else
    MAX_FILE_SIZE=10485760
    log "MAX_FILE_SIZE not set, using default: 10MB (10485760 bytes)"
fi
export MAX_FILE_SIZE

log "Final environment configuration:"
log "  NODE_ENV: $NODE_ENV"
log "  NGINX_LISTEN_PORT: $NGINX_LISTEN_PORT"
log "  INTERNAL_API_PORT: $API_PORT"
log "  UPLOAD_PATH: $UPLOAD_PATH"
log "  CONFIG_PATH: $CONFIG_PATH"
log "  MAX_FILE_SIZE: $MAX_FILE_SIZE bytes"

# Process Nginx configuration to inject the dynamic port
log "Configuring Nginx to listen on port $NGINX_LISTEN_PORT..."
# Use sed to replace the placeholder with the actual port
sed -i "s/\${LISTEN_PORT}/$NGINX_LISTEN_PORT/g" /etc/nginx/nginx.conf

# Volume mount and directory validation
log "Validating volume mounts and directories..."

# Check if directories are volume mounts
check_volume_mount() {
    local dir="$1"
    local mount_info=$(mount | grep " $dir " 2>/dev/null || true)
    
    if [ -n "$mount_info" ]; then
        log "Volume mount detected for $dir: $mount_info"
        return 0
    else
        log "No volume mount detected for $dir (using container filesystem)"
        return 1
    fi
}

# Validate and create upload directory
log "Validating upload directory: $UPLOAD_PATH"
if [ ! -d "$UPLOAD_PATH" ]; then
    log "Creating upload directory: $UPLOAD_PATH"
    if ! mkdir -p "$UPLOAD_PATH"; then
        log "Error: Failed to create upload directory: $UPLOAD_PATH"
        log "This may indicate a volume mount issue or permission problem"
        exit 1
    fi
else
    log "Upload directory exists: $UPLOAD_PATH"
fi

# Check if upload directory is writable
if [ ! -w "$UPLOAD_PATH" ]; then
    log "Warning: Upload directory is not writable: $UPLOAD_PATH"
    log "Attempting to fix permissions..."
    
    if ! chmod 755 "$UPLOAD_PATH" 2>/dev/null; then
        log "Error: Cannot fix permissions for upload directory"
        log "This may indicate a volume mount permission issue"
        
        # Try to create a test file as fallback
        if ! touch "$UPLOAD_PATH/.write_test" 2>/dev/null; then
            log "Error: Upload directory is not writable and cannot be fixed"
            exit 1
        else
            rm -f "$UPLOAD_PATH/.write_test"
            log "Upload directory is writable despite permission warnings"
        fi
    fi
fi

# Validate and create config directory
log "Validating config directory: $CONFIG_PATH"
if [ ! -d "$CONFIG_PATH" ]; then
    log "Creating config directory: $CONFIG_PATH"
    if ! mkdir -p "$CONFIG_PATH"; then
        log "Error: Failed to create config directory: $CONFIG_PATH"
        log "This may indicate a volume mount issue or permission problem"
        exit 1
    fi
else
    log "Config directory exists: $CONFIG_PATH"
fi

# Check if config directory is writable
if [ ! -w "$CONFIG_PATH" ]; then
    log "Warning: Config directory is not writable: $CONFIG_PATH"
    log "Attempting to fix permissions..."
    
    if ! chmod 755 "$CONFIG_PATH" 2>/dev/null; then
        log "Error: Cannot fix permissions for config directory"
        log "This may indicate a volume mount permission issue"
        
        # Try to create a test file as fallback
        if ! touch "$CONFIG_PATH/.write_test" 2>/dev/null; then
            log "Error: Config directory is not writable and cannot be fixed"
            exit 1
        else
            rm -f "$CONFIG_PATH/.write_test"
            log "Config directory is writable despite permission warnings"
        fi
    fi
fi

# Check volume mount status
check_volume_mount "$UPLOAD_PATH" || true
UPLOAD_IS_VOLUME=$?

check_volume_mount "$CONFIG_PATH" || true
CONFIG_IS_VOLUME=$?

# Set proper ownership with graceful fallback
log "Setting directory ownership..."
if ! chown -R nginx:nginx "$UPLOAD_PATH" "$CONFIG_PATH" 2>/dev/null; then
    log "Warning: Could not set nginx ownership on directories"
    
    # Try alternative ownership approaches
    if command -v id >/dev/null 2>&1; then
        CURRENT_USER=$(id -u)
        CURRENT_GROUP=$(id -g)
        log "Current user: $CURRENT_USER, group: $CURRENT_GROUP"
        
        if ! chown -R "$CURRENT_USER:$CURRENT_GROUP" "$UPLOAD_PATH" "$CONFIG_PATH" 2>/dev/null; then
            log "Warning: Could not set any ownership, using default permissions"
        else
            log "Set ownership to current user: $CURRENT_USER:$CURRENT_GROUP"
        fi
    fi
fi

# Initialize default config file if it doesn't exist
CONFIG_FILE="$CONFIG_PATH/config.json"
if [ ! -f "$CONFIG_FILE" ]; then
    log "Creating default config file: $CONFIG_FILE"
    cat > "$CONFIG_FILE" << 'EOF'
{
  "logo": "",
  "banner": "",
  "carouselSlides": [],
  "buttonLinks": [],
  "toolIcons": [],
  "floatAdButtons": []
}
EOF
    
    if [ ! -f "$CONFIG_FILE" ]; then
        log "Error: Failed to create default config file"
        log "This indicates a serious volume mount or permission issue"
        exit 1
    else
        log "Default config file created successfully"
    fi
else
    log "Config file exists: $CONFIG_FILE"
fi

# Validate config file is readable
if [ ! -r "$CONFIG_FILE" ]; then
    log "Error: Config file is not readable: $CONFIG_FILE"
    exit 1
fi

# Log volume mount summary
log "Volume mount summary:"
if [ $UPLOAD_IS_VOLUME -eq 0 ]; then
    log "  Upload directory: VOLUME MOUNTED"
else
    log "  Upload directory: CONTAINER FILESYSTEM"
fi

if [ $CONFIG_IS_VOLUME -eq 0 ]; then
    log "  Config directory: VOLUME MOUNTED"
else
    log "  Config directory: CONTAINER FILESYSTEM"
fi

log "Directory validation completed successfully"

# Dependency checking
log "Checking dependencies..."

# Check if Node.js is available
if ! command -v node >/dev/null 2>&1; then
    log "Error: Node.js is not installed or not in PATH"
    exit 1
fi

# Check if npm is available
if ! command -v npm >/dev/null 2>&1; then
    log "Error: npm is not installed or not in PATH"
    exit 1
fi

# Check if nginx is available
if ! command -v nginx >/dev/null 2>&1; then
    log "Error: nginx is not installed or not in PATH"
    exit 1
fi

# Check if curl is available for health checks
if ! command -v curl >/dev/null 2>&1; then
    log "Error: curl is not installed or not in PATH"
    exit 1
fi

# Verify backend directory and files exist
if [ ! -d "/app/backend" ]; then
    log "Error: Backend directory /app/backend does not exist"
    exit 1
fi

if [ ! -f "/app/backend/package.json" ]; then
    log "Error: Backend package.json not found"
    exit 1
fi

# Verify frontend files exist
if [ ! -d "/usr/share/nginx/html/demo" ]; then
    log "Error: Demo frontend files not found"
    exit 1
fi

if [ ! -d "/usr/share/nginx/html/manager" ]; then
    log "Error: Manager frontend files not found"
    exit 1
fi

# Verify nginx configuration
if [ ! -f "/etc/nginx/nginx.conf" ]; then
    log "Error: Nginx configuration not found"
    exit 1
fi

# Test nginx configuration
if ! nginx -t >/dev/null 2>&1; then
    log "Error: Nginx configuration is invalid"
    nginx -t
    exit 1
fi

log "All dependencies verified successfully"

# Start Manager Backend with enhanced monitoring
log "Starting Manager Backend..."
cd /app/backend

# Set environment variables for backend
export PORT=$API_PORT
export UPLOAD_DIR=$UPLOAD_PATH
export CONFIG_DIR=$CONFIG_PATH

# Start backend in background
npm start &
BACKEND_PID=$!

# Enhanced backend readiness check
log "Waiting for backend to start..."
BACKEND_READY=false
for i in $(seq 1 60); do
    # Check if process is still running
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        log "Error: Backend process died during startup"
        exit 2
    fi
    
    # Check if backend is responding
    if curl -f -s http://localhost:$API_PORT/api/health >/dev/null 2>&1; then
        log "Backend is ready (attempt $i/60)"
        BACKEND_READY=true
        break
    fi
    
    if [ $i -eq 60 ]; then
        log "Error: Backend failed to start within 60 seconds"
        log "Backend process status: $(kill -0 $BACKEND_PID 2>&1 || echo 'not running')"
        kill $BACKEND_PID 2>/dev/null || true
        exit 2
    fi
    
    if [ $((i % 10)) -eq 0 ]; then
        log "  Still waiting for backend... (attempt $i/60)"
    fi
    sleep 1
done

if [ "$BACKEND_READY" = "false" ]; then
    log "Error: Backend readiness check failed"
    exit 2
fi

# Verify backend health
log "Verifying backend health..."
HEALTH_RESPONSE=$(curl -s http://localhost:$API_PORT/api/health || echo "")
if echo "$HEALTH_RESPONSE" | grep -q '"status":"healthy"'; then
    log "Backend health check passed"
else
    log "Warning: Backend health check returned unexpected response: $HEALTH_RESPONSE"
fi

# Start Nginx with enhanced monitoring
log "Starting Nginx..."
nginx -g "daemon off;" &
NGINX_PID=$!

# Verify Nginx started successfully
sleep 2
if ! kill -0 $NGINX_PID 2>/dev/null; then
    log "Error: Nginx failed to start"
    kill $BACKEND_PID 2>/dev/null || true
    exit 3
fi

# Test Nginx is serving content
log "Verifying Nginx is serving content..."
NGINX_READY=false
for i in $(seq 1 30); do
    if curl -f -s http://localhost:$NGINX_LISTEN_PORT/health >/dev/null 2>&1; then
        log "Nginx is ready and serving content (attempt $i/30)"
        NGINX_READY=true
        break
    fi
    
    if [ $i -eq 30 ]; then
        log "Error: Nginx failed to serve content within 30 seconds"
        kill $NGINX_PID 2>/dev/null || true
        kill $BACKEND_PID 2>/dev/null || true
        exit 3
    fi
    
    if [ $((i % 10)) -eq 0 ]; then
        log "  Still waiting for Nginx... (attempt $i/30)"
    fi
    sleep 1
done

if [ "$NGINX_READY" = "false" ]; then
    log "Error: Nginx readiness check failed"
    exit 3
fi

log "All services started successfully!"
log "  - Backend API: http://localhost:$API_PORT"
log "  - Demo Frontend: http://localhost/"
log "  - Manager Frontend: http://localhost/admin/"
log "  - Health Check: http://localhost/health"

# Enhanced shutdown function
shutdown() {
    log "Received shutdown signal, stopping services gracefully..."
    
    # Stop Nginx first (stop accepting new requests)
    if kill -0 $NGINX_PID 2>/dev/null; then
        log "Stopping Nginx..."
        kill -TERM $NGINX_PID 2>/dev/null || true
        
        # Wait for Nginx to stop gracefully
        for i in $(seq 1 10); do
            if ! kill -0 $NGINX_PID 2>/dev/null; then
                log "Nginx stopped gracefully"
                break
            fi
            sleep 1
        done
        
        # Force kill if still running
        if kill -0 $NGINX_PID 2>/dev/null; then
            log "Force stopping Nginx..."
            kill -KILL $NGINX_PID 2>/dev/null || true
        fi
    fi
    
    # Stop Backend
    if kill -0 $BACKEND_PID 2>/dev/null; then
        log "Stopping Backend..."
        kill -TERM $BACKEND_PID 2>/dev/null || true
        
        # Wait for Backend to stop gracefully
        for i in $(seq 1 15); do
            if ! kill -0 $BACKEND_PID 2>/dev/null; then
                log "Backend stopped gracefully"
                break
            fi
            sleep 1
        done
        
        # Force kill if still running
        if kill -0 $BACKEND_PID 2>/dev/null; then
            log "Force stopping Backend..."
            kill -KILL $BACKEND_PID 2>/dev/null || true
        fi
    fi
    
    log "All services stopped"
    exit 0
}

# Process monitoring function
monitor_processes() {
    while true; do
        # Check if backend is still running
        if ! kill -0 $BACKEND_PID 2>/dev/null; then
            log "Error: Backend process died unexpectedly"
            kill $NGINX_PID 2>/dev/null || true
            exit 4
        fi
        
        # Check if nginx is still running
        if ! kill -0 $NGINX_PID 2>/dev/null; then
            log "Error: Nginx process died unexpectedly"
            kill $BACKEND_PID 2>/dev/null || true
            exit 5
        fi
        
        # Check backend health every 30 seconds
        if ! curl -f -s http://localhost:$API_PORT/api/health >/dev/null 2>&1; then
            log "Warning: Backend health check failed, but process is still running"
        fi
        
        sleep 30
    done
}

# Trap signals for graceful shutdown
trap shutdown TERM INT QUIT

# Start process monitoring in background
monitor_processes &
MONITOR_PID=$!

log "Container startup completed successfully"
log "Process monitoring started (PID: $MONITOR_PID)"

# Wait for any process to exit
wait -n

# If we get here, one of the processes died
log "One of the services died, shutting down container"
kill $MONITOR_PID 2>/dev/null || true
shutdown