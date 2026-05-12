# Docker Setup for Be Demo Frontend

## Quick Start

### Development Mode

Start the development server in Docker:

```bash
./scripts/start-dev.sh
```

Or manually:

```bash
docker-compose up -d admin-demo-dev
```

The application will be available at: http://localhost:8081

### Production Mode

Build and run production version:

```bash
docker-compose --profile production up -d admin-demo-prod
```

The application will be available at: http://localhost:8080

## Environment Variables

The application uses environment variables from `.env` file:

- `VITE_API_URL` - Backend API URL (default: http://localhost:8000)
- `VITE_API_HTTPS_URL` - Backend API HTTPS URL (default: https://localhost:8001)
- `VITE_APP_NAME` - Application name (default: Be Demo Frontend)
- `VITE_APP_VERSION` - Application version (default: 1.0.0)
- `VITE_PORT` - Development server port (default: 8081)

### Creating .env File

If `.env` doesn't exist, copy from example:

```bash
cp .env.example .env
```

Then edit `.env` and update values as needed.

## Docker Commands

### View Logs

```bash
# Development
docker-compose logs -f admin-demo-dev

# Production
docker-compose logs -f admin-demo-prod
```

### Stop Containers

```bash
./scripts/stop-dev.sh
```

Or manually:

```bash
docker-compose down
```

### Restart Containers

```bash
docker-compose restart admin-demo-dev
```

### Rebuild Containers

```bash
docker-compose build --no-cache admin-demo-dev
docker-compose up -d admin-demo-dev
```

## Dockerfiles

- `Dockerfile` - Production build with Nginx
- `Dockerfile.dev` - Development server with hot reload

## Volumes

Development container uses volume mounts for:

- Source code (`.:/app`) - Live code changes
- Node modules (`/app/node_modules`) - Isolated dependencies

## Network

All containers run on `admin-demo-network` bridge network.

## Troubleshooting

### Port Already in Use

If port 8081 is already in use:

```bash
# Find process using port
lsof -ti:8081

# Kill process
lsof -ti:8081 | xargs kill -9

# Or change port in .env
VITE_PORT=8082
```

### Container Won't Start

Check logs:

```bash
docker-compose logs admin-demo-dev
```

### Environment Variables Not Working

Make sure `.env` file exists and variables are prefixed with `VITE_` for Vite to expose them.
