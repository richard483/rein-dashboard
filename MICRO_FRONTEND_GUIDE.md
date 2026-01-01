# Micro-Frontend Extraction Guide

## Overview
This guide explains how to extract the User Management and RBAC Management modules from this monolithic SvelteKit application into standalone micro-frontends. The architecture has been designed with modularity in mind to facilitate this process.

## Architecture Design

### Current Structure
```
src/lib/modules/
├── shared/              # Core utilities (can become npm package)
│   ├── api/            # HTTP client with auth
│   ├── auth/           # Authentication store & guards
│   ├── components/     # Reusable UI components
│   └── types/          # Shared TypeScript types
├── user-management/    # User module (can become standalone app)
│   ├── api/
│   ├── stores/
│   ├── components/
│   └── types/
└── rbac-management/    # RBAC module (can become standalone app)
    ├── api/
    ├── stores/
    ├── components/
    └── types/
```

## Extraction Steps

### Step 1: Extract Shared Module as NPM Package

#### 1.1 Create New Package
```bash
mkdir rein-shared
cd rein-shared
npm init -y
```

#### 1.2 Package Configuration
```json
{
  "name": "@rein/shared",
  "version": "1.0.0",
  "type": "module",
  "exports": {
    "./api": "./dist/api/index.js",
    "./auth": "./dist/auth/index.js",
    "./components": "./dist/components/index.js",
    "./types": "./dist/types/index.js"
  },
  "peerDependencies": {
    "svelte": "^5.0.0"
  }
}
```

#### 1.3 Copy Shared Module
```bash
cp -r src/lib/modules/shared/* rein-shared/src/
```

#### 1.4 Build & Publish
```bash
npm run build
npm publish --access public
```

### Step 2: Extract User Management as Micro-Frontend

#### 2.1 Create New SvelteKit App
```bash
npm create svelte@latest rein-user-management
cd rein-user-management
npm install
npm install @rein/shared
```

#### 2.2 Copy Module Files
```bash
# Copy user management module
cp -r ../rein-management/src/lib/modules/user-management src/lib/modules/

# Copy routes
cp -r ../rein-management/src/routes/(protected)/users src/routes/
```

#### 2.3 Update Imports
Replace all imports from `$lib/modules/shared/` with `@rein/shared/`:

```typescript
// Before
import { api } from '$lib/modules/shared/api/client';
import { showToast } from '$lib/modules/shared/components';

// After
import { api } from '@rein/shared/api';
import { showToast } from '@rein/shared/components';
```

#### 2.4 Configure Base Path (Optional)
For deploying as a sub-application:

```javascript
// svelte.config.js
export default {
  kit: {
    paths: {
      base: '/users'
    }
  }
};
```

### Step 3: Extract RBAC Management as Micro-Frontend

#### 3.1 Create New SvelteKit App
```bash
npm create svelte@latest rein-rbac-management
cd rein-rbac-management
npm install
npm install @rein/shared
```

#### 3.2 Copy Module Files
```bash
# Copy RBAC management module
cp -r ../rein-management/src/lib/modules/rbac-management src/lib/modules/

# Copy routes
cp -r ../rein-management/src/routes/(protected)/rbac src/routes/
```

#### 3.3 Update Imports
Same as user management - replace shared imports with `@rein/shared/`.

#### 3.4 Configure Base Path (Optional)
```javascript
// svelte.config.js
export default {
  kit: {
    paths: {
      base: '/rbac'
    }
  }
};
```

## Integration Strategies

### Option 1: Nginx Reverse Proxy

Configure Nginx to route requests to different micro-frontends:

```nginx
server {
  listen 80;
  server_name management.example.com;

  # Main dashboard
  location / {
    proxy_pass http://localhost:3000;
  }

  # User management micro-frontend
  location /users {
    proxy_pass http://localhost:3001;
  }

  # RBAC management micro-frontend
  location /rbac {
    proxy_pass http://localhost:3002;
  }
}
```

### Option 2: Module Federation (Vite)

Use Vite's module federation plugin for runtime integration:

```javascript
// vite.config.ts (host app)
import { defineConfig } from 'vite';
import { federation } from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    federation({
      name: 'host',
      remotes: {
        userManagement: 'http://localhost:3001/assets/remoteEntry.js',
        rbacManagement: 'http://localhost:3002/assets/remoteEntry.js'
      },
      shared: ['svelte']
    })
  ]
});
```

### Option 3: iFrame Integration

Simple iframe-based integration (least recommended):

```svelte
<!-- Dashboard -->
<iframe 
  src="http://localhost:3001/users" 
  title="User Management"
  style="width: 100%; height: 100vh; border: none;"
/>
```

## Shared Authentication

### Centralized Auth Service

The `@rein/shared/auth` module provides centralized authentication:

```typescript
// All micro-frontends use the same auth store
import { authStore, isAuthenticated, currentUser } from '@rein/shared/auth';

// Token is stored in localStorage and shared across all apps
// on the same domain
```

### Token Sharing Strategies

#### Same Domain (Recommended)
- Deploy all micro-frontends on same domain (e.g., `management.example.com`)
- LocalStorage tokens automatically shared
- No additional configuration needed

#### Cross-Domain
Use a shared authentication service:

```typescript
// auth-service.ts
class AuthService {
  private static instance: AuthService;
  
  async getToken(): Promise<string | null> {
    // Fetch from centralized auth service
    const response = await fetch('https://auth.example.com/token', {
      credentials: 'include'
    });
    return response.json();
  }
  
  async refreshToken(): Promise<void> {
    // Refresh via centralized service
  }
}
```

## API Client Configuration

### Environment Variables

Each micro-frontend needs its `.env` configuration:

```bash
# User Management .env
VITE_API_URL=http://localhost:8080
VITE_APP_NAME=User Management

# RBAC Management .env
VITE_API_URL=http://localhost:8080
VITE_APP_NAME=RBAC Management
```

### API Client Singleton

The shared API client handles token management automatically:

```typescript
// From @rein/shared/api
import { api } from '@rein/shared/api';

// All requests automatically include auth token
const users = await api.get('/admin/users');
```

## Development Workflow

### Local Development

Run all micro-frontends simultaneously:

```bash
# Terminal 1 - Shared package (watch mode)
cd rein-shared
npm run dev

# Terminal 2 - User Management
cd rein-user-management
npm run dev -- --port 3001

# Terminal 3 - RBAC Management
cd rein-rbac-management
npm run dev -- --port 3002

# Terminal 4 - Main Dashboard
cd rein-dashboard
npm run dev -- --port 3000
```

### Hot Module Replacement

Each micro-frontend has independent HMR:
- Changes in user management don't affect RBAC
- Faster build times for individual modules
- Independent deployments

## Deployment

### Containerization

Each micro-frontend gets its own Docker container:

```dockerfile
# Dockerfile (User Management)
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["node", "build"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  user-management:
    build: ./rein-user-management
    ports:
      - "3001:3000"
    environment:
      - VITE_API_URL=http://api:8080
  
  rbac-management:
    build: ./rein-rbac-management
    ports:
      - "3002:3000"
    environment:
      - VITE_API_URL=http://api:8080
  
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - user-management
      - rbac-management
```

### Kubernetes

Deploy each micro-frontend as a separate service:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-management
spec:
  replicas: 3
  selector:
    matchLabels:
      app: user-management
  template:
    metadata:
      labels:
        app: user-management
    spec:
      containers:
      - name: user-management
        image: rein/user-management:latest
        ports:
        - containerPort: 3000
        env:
        - name: VITE_API_URL
          value: "http://api-service:8080"
```

## Benefits of Extraction

### Independent Scaling
- Scale user management independently during heavy usage
- RBAC management can run on smaller resources
- Cost optimization based on actual usage

### Team Autonomy
- Different teams can own different micro-frontends
- Independent release cycles
- Reduced merge conflicts

### Technology Flexibility
- Future modules can use different frameworks
- Gradual migration possibilities
- A/B testing different implementations

### Performance
- Smaller bundle sizes per micro-frontend
- Faster build times
- Parallel loading of modules

## Migration Checklist

### Pre-Extraction
- [ ] Ensure all shared dependencies are in `shared` module
- [ ] Document cross-module dependencies
- [ ] Set up CI/CD pipelines for each service
- [ ] Plan API versioning strategy

### During Extraction
- [ ] Create npm package for shared module
- [ ] Set up new repositories for each micro-frontend
- [ ] Update import paths
- [ ] Configure base paths if needed
- [ ] Set up environment variables

### Post-Extraction
- [ ] Configure reverse proxy/ingress
- [ ] Set up monitoring for each service
- [ ] Document new architecture
- [ ] Update deployment procedures
- [ ] Train team on new workflow

## Testing Strategy

### Unit Tests
Each micro-frontend has its own test suite:

```bash
# User Management
cd rein-user-management
npm run test

# RBAC Management
cd rein-rbac-management
npm run test
```

### Integration Tests
Test cross-module interactions:

```typescript
// Integration test
describe('User Role Assignment', () => {
  it('should use RBAC roles in user management', async () => {
    // Test that user management correctly uses roles from RBAC
  });
});
```

### E2E Tests
Use tools like Playwright to test the entire system:

```typescript
// e2e/user-management.spec.ts
test('assign role to user', async ({ page }) => {
  await page.goto('http://localhost:3000/users/123/roles');
  // Test full workflow across micro-frontends
});
```

## Monitoring & Observability

### Distributed Tracing
Implement OpenTelemetry for cross-service tracing:

```typescript
// api client with tracing
import { trace } from '@opentelemetry/api';

api.get('/users').then(users => {
  const span = trace.getActiveSpan();
  span?.setAttribute('user.count', users.length);
});
```

### Logging
Centralized logging with correlation IDs:

```typescript
// Each request gets a correlation ID
const correlationId = crypto.randomUUID();
api.get('/users', {
  headers: { 'X-Correlation-ID': correlationId }
});
```

## Rollback Strategy

### Version Pinning
Pin shared module versions in each micro-frontend:

```json
{
  "dependencies": {
    "@rein/shared": "1.2.3"  // Exact version, not ^1.2.3
  }
}
```

### Blue-Green Deployment
Deploy new versions alongside old ones:

```nginx
# Route 10% of traffic to new version
split_clients $remote_addr $version {
  10%     new;
  *       old;
}

location /users {
  proxy_pass http://user-management-$version;
}
```

## Security Considerations

### Token Management
- Tokens stored in httpOnly cookies (recommended)
- Or localStorage with XSS protection
- Shared across same-origin micro-frontends

### CORS Configuration
```typescript
// API server CORS config
cors({
  origin: [
    'http://localhost:3001',  // User Management
    'http://localhost:3002',  // RBAC Management
    'https://management.example.com'
  ],
  credentials: true
});
```

### Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               connect-src http://localhost:8080;
               frame-ancestors 'none';">
```

## Cost Estimation

### Monolithic (Current)
- 1 VM/Container running entire app
- Single database connection pool
- Simpler infrastructure

### Micro-Frontend (After Extraction)
- 3+ containers (user, RBAC, dashboard, shared)
- Nginx/Load Balancer
- More complex orchestration
- Better scalability and team autonomy

**Recommendation**: Start with monolithic, extract when team/scale demands it.

## Conclusion

The current codebase is **ready for micro-frontend extraction** with minimal effort due to:

1. ✅ Modular architecture with clear boundaries
2. ✅ Shared utilities isolated in `shared` module
3. ✅ Consistent API patterns
4. ✅ No tight coupling between user and RBAC modules
5. ✅ Environment-based configuration

You can extract whenever organizational needs (team size, scaling, release cycles) justify the added complexity.
