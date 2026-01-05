# B9 Website Docker Deployment

This directory contains Docker configuration files for deploying the B9 Website Recreation system as a single container.

## Architecture

The Docker container includes:
- **Nginx** (port 80) - Reverse proxy and static file server
- **Demo Frontend** - Static files served at `/`
- **Manager Frontend** - Static files served at `/admin/`
- **Manager Backend** - Node.js API server (internal port 3005)

## Quick Start

### 1. Build the Docker Image

```bash
./docker/build.sh
```

### 2. Deploy with Docker Compose

```bash
./docker/deploy.sh
```

### 3. Access the Applications

- **Demo Website**: http://localhost
- **Admin Panel**: http://localhost/admin
- **API Health Check**: http://localhost/health

## Manual Deployment

### Build Image

```bash
docker build -t b9-website:latest .
```

### Run Container

```bash
# Create data directories
mkdir -p uploads data

# Run container
docker run -d \
  --name b9-website \
  -p 80:80 \
  -v ./uploads:/app/uploads \
  -v ./data:/app/data \
  -e NODE_ENV=production \
  b9-website:latest
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Runtime environment |
| `API_PORT` | `3005` | Backend API port (internal) |
| `UPLOAD_PATH` | `/app/uploads` | File upload directory |
| `MAX_FILE_SIZE` | `10485760` | Max upload size (10MB) |

## Volume Mounts

| Host Path | Container Path | Purpose |
|-----------|----------------|---------|
| `./uploads` | `/app/uploads` | Uploaded images |
| `./data` | `/app/data` | Configuration data |

## Health Checks

The container includes built-in health checks:
- **Endpoint**: `http://localhost/health`
- **Docker Health Check**: Automatic monitoring
- **Startup Verification**: All services checked on startup

## Troubleshooting

### View Logs

```bash
# Docker Compose
docker-compose logs -f

# Direct Docker
docker logs -f b9-website
```

### Check Service Status

```bash
# Container status
docker-compose ps

# Health check
curl http://localhost/health
```

### Common Issues

1. **Port 80 already in use**
   ```bash
   # Change port in docker-compose.yml
   ports:
     - "8080:80"  # Use port 8080 instead
   ```

2. **Permission issues with volumes**
   ```bash
   # Fix permissions
   sudo chown -R $USER:$USER uploads data
   chmod 755 uploads data
   ```

3. **Backend fails to start**
   - Check if Node.js dependencies are installed
   - Verify environment variables
   - Check logs for specific error messages

## Development Mode

For development with hot reloading:

```bash
# Set development environment
export NODE_ENV=development

# Build and run
docker-compose up --build
```

## Security Notes

- Only port 80 is exposed externally
- File uploads are restricted to image types
- Security headers are configured in Nginx
- Services run with minimal privileges where possible

## File Structure

```
/app/
├── nginx/nginx.conf          # Nginx configuration
├── uploads/                  # Uploaded images (volume)
├── data/                     # Configuration data (volume)
├── backend/                  # Manager Backend
└── static/
    ├── demo/                 # Demo Frontend (built)
    └── manager/              # Manager Frontend (built)
```