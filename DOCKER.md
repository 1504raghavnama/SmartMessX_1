# Docker Guide - SmartMessX

This guide explains how to build, run, and deploy the SmartMessX React + Vite application using Docker.

---

## Quick Start

### Build the Docker Image

```bash
docker build -t smartmessx:latest .
```

### Run the Container

```bash
docker run -p 3000:80 smartmessx:latest
```

Then open: **http://localhost:3000**

---

## Detailed Build Instructions

### 1. Build the Image

```bash
# Basic build
docker build -t smartmessx:latest .

# Build with tag and version
docker build -t smartmessx:v1.0.0 .
docker build -t smartmessx:latest .

# Build with build args (if needed)
docker build -t smartmessx:latest \
  --build-arg NODE_ENV=production \
  .
```

### 2. View Image Size

```bash
docker images smartmessx

# Output example:
# REPOSITORY     TAG       IMAGE ID       CREATED        SIZE
# smartmessx     latest    abc123xyz      2 minutes ago  45MB
```

---

## Running the Container

### Basic Run

```bash
docker run -p 3000:80 smartmessx:latest
```

Maps:
- **Host port 3000** → **Container port 80**
- Access at: http://localhost:3000

---

### Run in Background

```bash
docker run -d -p 3000:80 --name smartmessx smartmessx:latest
```

- `-d`: Run in detached mode (background)
- `--name smartmessx`: Give the container a name
- Can stop with: `docker stop smartmessx`

---

### Run with Environment Variables

```bash
docker run -d -p 3000:80 \
  -e VITE_SUPABASE_URL="https://your-supabase.co" \
  -e VITE_SUPABASE_ANON_KEY="your-key" \
  --name smartmessx \
  smartmessx:latest
```

**Note**: If you use `.env` file, mount it:

```bash
docker run -d -p 3000:80 \
  --env-file .env \
  --name smartmessx \
  smartmessx:latest
```

---

### Run with Volume (for development)

⚠️ **Not recommended for production**, but useful for testing:

```bash
docker run -d -p 3000:80 \
  -v $(pwd)/dist:/usr/share/nginx/html \
  --name smartmessx \
  smartmessx:latest
```

---

## Docker Compose (Production-Ready)

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  smartmessx:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    environment:
      - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
    container_name: smartmessx
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost/"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s
```

### Run with Docker Compose

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# View logs
docker-compose logs -f

# Rebuild
docker-compose up -d --build
```

---

## Common Docker Commands

### List Images
```bash
docker images smartmessx
```

### List Running Containers
```bash
docker ps
```

### View Container Logs
```bash
docker logs -f smartmessx
```

### Stop Container
```bash
docker stop smartmessx
```

### Remove Container
```bash
docker rm smartmessx
```

### Remove Image
```bash
docker rmi smartmessx:latest
```

### Inspect Container
```bash
docker inspect smartmessx
```

### Execute Command in Container
```bash
docker exec -it smartmessx sh
```

---

## Dockerfile Optimization

### Multi-Stage Build

✅ **Our Dockerfile uses multi-stage build:**

1. **Stage 1 (Build)**: Node 20 Alpine
   - Installs dependencies
   - Builds the Vite app
   - Creates optimized `dist/` folder
   - ~600MB intermediate size

2. **Stage 2 (Production)**: Nginx Alpine
   - Only copies `dist/` folder
   - Final image: ~45MB
   - Nginx serves static files efficiently

### Image Size Comparison

| Approach | Size |
|----------|------|
| Single stage (Node + build output) | ~300MB |
| Multi-stage with Node + Nginx | ~45MB |
| **Our setup (optimized)** | **~45MB** |

---

## Performance Tips

### 1. Layer Caching

Dockerfile copies `package.json` before source code:

```dockerfile
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build
```

This way, dependencies only rebuild if `package.json` changes, not on every code change.

### 2. Nginx Gzip Compression

Enabled in `nginx.conf`:
- Reduces JS/CSS by ~70%
- Compresses JSON API responses

### 3. Asset Caching

Static assets (JS, CSS, images) cached for 1 year:
```nginx
location ~* \.(js|css|png|jpg|...)$ {
    expires 1y;
}
```

### 4. Security Headers

Configured in `nginx.conf`:
- `X-Frame-Options`: Prevents clickjacking
- `X-Content-Type-Options`: Prevents MIME sniffing
- `X-XSS-Protection`: XSS protection
- `Referrer-Policy`: Privacy protection

---

## Deployment Examples

### 1. Docker Hub

```bash
# Tag for Docker Hub
docker tag smartmessx:latest myusername/smartmessx:latest

# Push to Docker Hub
docker push myusername/smartmessx:latest

# Run from Docker Hub
docker run -p 3000:80 myusername/smartmessx:latest
```

### 2. AWS ECS

```bash
# Create ECR repository
aws ecr create-repository --repository-name smartmessx

# Tag for ECR
docker tag smartmessx:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/smartmessx:latest

# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/smartmessx:latest
```

### 3. Docker Swarm

```bash
docker service create \
  --name smartmessx \
  -p 3000:80 \
  smartmessx:latest
```

### 4. Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: smartmessx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: smartmessx
  template:
    metadata:
      labels:
        app: smartmessx
    spec:
      containers:
      - name: smartmessx
        image: smartmessx:latest
        ports:
        - containerPort: 80
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 10
```

---

## Troubleshooting

### Container exits immediately

```bash
docker logs smartmessx
```

**Common causes:**
- Nginx config error
- Port already in use
- Permission issues

### Cannot access application

```bash
# Verify container is running
docker ps

# Check port mapping
docker port smartmessx

# Test connectivity
curl http://localhost:3000
```

### Environment variables not loaded

```bash
# Verify they're set
docker exec smartmessx printenv | grep VITE
```

### Build fails

```bash
# Check build logs
docker build -t smartmessx:latest . --progress=plain

# Clean and rebuild
docker builder prune
docker build --no-cache -t smartmessx:latest .
```

---

## .dockerignore File

Current `.dockerignore` excludes:
- `node_modules/` - Already installed in container
- `dist/` - Rebuilt from source
- `.git/` - Not needed in container
- `*.md` - Documentation
- `.env.example` - Template only
- `supabase/` - Local dev files
- `.vscode/`, `.idea/` - IDE files

If you add new dev-only files, add them to `.dockerignore`.

---

## Development vs Production

### Development (local)
```bash
npm run dev
```

### Production (Docker)
```bash
docker run -p 3000:80 smartmessx:latest
```

The Docker image:
1. Builds optimized Vite bundle
2. Serves with nginx (much faster than dev server)
3. Includes security headers
4. Has gzip compression enabled
5. Uses browser caching for assets

---

## Health Check

Container includes built-in health check:

```bash
docker inspect smartmessx --format='{{json .State.Health}}'

# Output: {"Status":"healthy", ...}
```

Kubernetes will automatically restart unhealthy containers.

---

## Best Practices Summary

✅ **Do:**
- Use multi-stage builds (done)
- Minimize final image size (45MB)
- Enable gzip compression (done)
- Set security headers (done)
- Use Alpine images (done)
- Pin Node/Nginx versions (done)
- Include health checks (done)
- Use non-root user (done)
- Layer caching optimization (done)

❌ **Don't:**
- Run as root
- Use large base images
- Copy unnecessary files
- Expose multiple ports
- Keep build artifacts in image
- Skip health checks

---

## References

- [Docker Docs](https://docs.docker.com/)
- [Nginx Docs](https://nginx.org/en/docs/)
- [Node.js Best Practices](https://github.com/nodejs/docker-node)
- [Vite Deployment](https://vitejs.dev/guide/static-deploy.html)

---

## Support

If you encounter issues:

1. Check container logs: `docker logs -f smartmessx`
2. Verify image built: `docker images smartmessx`
3. Test locally: `docker run -it smartmessx:latest sh`
4. Check nginx config: `docker exec smartmessx cat /etc/nginx/conf.d/default.conf`
