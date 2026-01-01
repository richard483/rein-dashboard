# Rein Management

A modern, modular User & RBAC Management system built with SvelteKit 2.49.1, designed with micro-frontend architecture in mind.

## 🎯 Features

### User Management
- ✅ User CRUD operations (Create, Read, Update, Delete)
- ✅ User activation/deactivation
- ✅ Role assignment to users
- ✅ View user permissions (inherited from roles)
- ✅ Pagination and search

### RBAC Management
- ✅ Role CRUD operations
- ✅ Permission CRUD operations
- ✅ Assign permissions to roles
- ✅ System role protection
- ✅ Permission grouping by resource

### Authentication & Security
- ✅ JWT-based authentication
- ✅ Automatic token refresh
- ✅ Superadmin-only access control
- ✅ Protected routes with guards
- ✅ Session management

### User Experience
- ✅ Real-time dashboard statistics
- ✅ Active navigation highlighting
- ✅ Loading states with spinners
- ✅ Toast notifications (success/error/info)
- ✅ Confirmation dialogs for destructive actions
- ✅ Minimal, clean UI design

## 🏗️ Architecture

### Modular Design
```
src/lib/modules/
├── shared/              # Core utilities (micro-frontend ready)
│   ├── api/            # HTTP client with token management
│   ├── auth/           # Authentication store & guards
│   ├── components/     # 8 reusable UI components
│   └── types/          # Shared TypeScript definitions
├── user-management/    # User module (extractable)
│   ├── api/            # User API layer
│   ├── stores/         # User state management
│   ├── components/     # User-specific components
│   └── types/          # User types
└── rbac-management/    # RBAC module (extractable)
    ├── api/            # Role & Permission APIs
    ├── stores/         # RBAC state management
    ├── components/     # RBAC components
    └── types/          # RBAC types
```

### Technology Stack
- **Framework**: SvelteKit 2.49.1
- **Language**: TypeScript 5.9.3
- **Svelte**: 5.45.6 (with runes: $state, $derived, $props)
- **Build Tool**: Vite 7.3.0
- **State Management**: Svelte stores (writable/derived)
- **Styling**: Minimal CSS (no frameworks)
- **Backend**: Karasu Auth API (Golang)

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ 
- npm or pnpm
- Karasu Auth API running on `http://localhost:8080`

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd rein-management
```

2. Install dependencies
```bash
npm install
```

3. Configure environment
```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:8080
```

4. Start development server
```bash
npm run dev
```

Visit `http://localhost:5173`

### Default Credentials
Login with superadmin credentials configured in your Karasu Auth backend.

## 📦 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run check        # Run TypeScript type checking
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

## 🎨 UI Components

### Shared Components (src/lib/modules/shared/components/)
1. **Button** - Versatile button with loading states
2. **Input** - Form input with label and error states
3. **Table** - Data table with sorting capabilities
4. **Pagination** - Page navigation with item counts
5. **Modal** - Overlay dialog for forms/content
6. **Spinner** - Loading indicator (small/medium/large)
7. **Toast** - Notification system (success/error/info)
8. **ConfirmDialog** - Confirmation modal for destructive actions

## 🔒 Authentication Flow

1. User logs in with credentials
2. Backend returns access token and refresh token
3. Tokens stored in localStorage
4. Access token included in all API requests
5. On 401 error, automatically refresh token
6. If refresh fails, redirect to login

## 📚 API Integration

### Backend API (Karasu Auth)
The application integrates with Karasu Auth API endpoints:

**Authentication**
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - User logout

**User Management**
- `GET /admin/users` - List users (paginated)
- `POST /admin/users` - Create user
- `GET /admin/users/:id` - Get user by ID
- `PUT /admin/users/:id` - Update user
- `DELETE /admin/users/:id` - Delete user
- `GET /admin/users/:id/roles` - Get user roles
- `POST /admin/users/:id/roles` - Assign roles
- `DELETE /admin/users/:id/roles` - Remove roles
- `GET /admin/users/:id/permissions` - Get user permissions

**RBAC Management**
- `GET /admin/roles` - List all roles
- `POST /admin/roles` - Create role
- `GET /admin/roles/:id` - Get role details
- `PUT /admin/roles/:id` - Update role
- `DELETE /admin/roles/:id` - Delete role
- `GET /admin/roles/:id/permissions` - Get role permissions
- `POST /admin/roles/:id/permissions` - Assign permissions
- `GET /admin/permissions` - List all permissions
- `POST /admin/permissions` - Create permission
- `DELETE /admin/permissions/:id` - Delete permission

## 🧪 Testing

### Type Checking
```bash
npm run check
```

Expected output:
```
svelte-check found 0 errors and 0 warnings
```

### Manual Testing Checklist
- [ ] Login with valid credentials
- [ ] Create new user
- [ ] Edit user details
- [ ] Assign roles to user
- [ ] View user permissions
- [ ] Delete user
- [ ] Create new role
- [ ] Edit role
- [ ] Assign permissions to role
- [ ] Delete non-system role
- [ ] Create new permission
- [ ] Delete permission
- [ ] Navigate between pages
- [ ] Check active route highlighting
- [ ] Verify loading states
- [ ] Confirm toast notifications
- [ ] Test confirmation dialogs

## 🔐 Security Features

### Access Control
- All management routes require superadmin privileges
- Layout-level route guards with automatic redirects
- Token stored in localStorage with automatic refresh
- API client handles 401 responses with token refresh

### Protected Routes
```
/(protected)/
├── users/              # User management (superadmin only)
├── rbac/roles/         # Role management (superadmin only)
└── rbac/permissions/   # Permission management (superadmin only)
```

### System Role Protection
- System roles cannot be edited or deleted
- Visual badges indicate system roles
- Delete operations blocked with user notification

## 📖 Documentation

- [Implementation Plan](IMPLEMENTATION_PLAN.md) - Complete 5-phase development plan
- [Micro-Frontend Guide](MICRO_FRONTEND_GUIDE.md) - How to extract modules
- [Phase 3 Complete](PHASE3_COMPLETE.md) - RBAC implementation summary
- [Phase 4 Complete](PHASE4_COMPLETE.md) - Navigation & integration summary

## 🎯 Roadmap

### Completed ✅
- [x] Project setup and configuration
- [x] Shared module (API client, auth, components)
- [x] User management module
- [x] RBAC management module
- [x] Dashboard with statistics
- [x] Navigation with active highlighting
- [x] Route guards and access control

### Future Enhancements
- [ ] Unit tests with Vitest
- [ ] E2E tests with Playwright
- [ ] User search and filtering
- [ ] Role search and filtering
- [ ] Audit logs
- [ ] User import/export
- [ ] Role templates
- [ ] Permission categories
- [ ] Dark mode support
- [ ] Internationalization (i18n)

## 🤝 Contributing

This is a private project. For internal contributions:

1. Create a feature branch
2. Make changes with clear commit messages
3. Run `npm run check` and ensure no errors
4. Submit pull request for review

### Code Style
- Use TypeScript for type safety
- Follow existing patterns for consistency
- Keep components small and focused
- Add JSDoc comments for complex functions
- Use Svelte 5 runes ($state, $derived, $props)

## 📝 Environment Variables

```env
# API Configuration
VITE_API_URL=http://localhost:8080

# Optional: Custom port
PORT=5173
```

## 🏗️ Building for Production

```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

The build outputs to the `build/` directory and can be deployed to:
- Node.js server
- Static hosting (Vercel, Netlify)
- Docker container
- Kubernetes cluster

### Docker Deployment

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "build"]
```

## 🔄 Micro-Frontend Extraction

The application is designed for easy extraction into micro-frontends. See [MICRO_FRONTEND_GUIDE.md](MICRO_FRONTEND_GUIDE.md) for detailed instructions on:

- Extracting shared module as npm package
- Creating standalone user management app
- Creating standalone RBAC management app
- Integration strategies (Nginx, Module Federation, iFrame)
- Authentication sharing
- Deployment patterns

## 🐛 Troubleshooting

### Common Issues

**401 Unauthorized Errors**
- Check if backend API is running
- Verify token is not expired
- Check VITE_API_URL in .env

**TypeScript Errors**
- Run `npm run check` to see all errors
- Ensure dependencies are installed
- Check Svelte version compatibility

**Build Errors**
- Clear `.svelte-kit` directory
- Run `npm install` again
- Check Node.js version (20+ required)

## 📄 License

Private - All Rights Reserved

## 👥 Team

Developed for internal use with focus on:
- Modularity and maintainability
- Type safety with TypeScript
- Modern Svelte 5 features
- Micro-frontend readiness
- Minimal styling for customization

## 🙏 Acknowledgments

- SvelteKit team for the excellent framework
- Karasu Auth backend team for the API
- Design inspiration from modern admin dashboards
