# API Integration Documentation

## Overview
This document describes the full-stack integration between the Ayurveda App frontend (React + TypeScript) and backend (Node.js + Express + MongoDB).

## Architecture

### Backend API
- **Base URL**: `http://localhost:5000`
- **Authentication**: JWT Bearer tokens
- **Database**: MongoDB with Mongoose ODM

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **State Management**: React Hooks (useState, useEffect)

## Setup Instructions

### 1. Backend Setup
```bash
cd backend
npm install
# Create .env file with:
# MONGO_URI=<your-mongodb-uri>
# JWT_SECRET=<your-secret>
# PORT=5000
# ALLOWED_ORIGINS=http://localhost:3000
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
# .env file already created with:
# VITE_API_BASE_URL=http://localhost:5000
npm run dev
```

## API Endpoints

### Authentication
- `POST /signup` - Register new user
  - Body: `{ name, email, password, accountType?: 'free'|'pro' }`
  - Returns: `{ token, user: { id, name, email } }`

- `POST /login` - User login
  - Body: `{ email, password }`
  - Returns: `{ token, user: { id, name, email } }`

### Doctors
- `GET /doctors` - List all doctors
  - Returns: `{ doctors: Doctor[] }`

- `POST /doctors/signup` - Register doctor
  - Body: `{ name, email, password, speciality?, clinicAddress?, fee?, phone? }`

- `POST /doctors/login` - Doctor login

### Products
- `GET /products?page=1&limit=12&q=search` - List products with pagination
  - Returns: `{ products, page, limit, total, pages }`

- `GET /products/:id` - Get single product

### Appointments (Requires Auth)
- `POST /appointments/request` - Create appointment
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ doctorId, date, mode?: 'online'|'offline', notes? }`

- `GET /appointments` - Get user's appointments

- `GET /appointments/:id` - Get single appointment

- `POST /appointments/:id/confirm` - Confirm appointment (doctors only)

### Cart (Requires Auth)
- `POST /cart/add` - Add item to cart
  - Body: `{ productId, quantity? }`

- `GET /cart` - Get current cart

- `POST /cart/checkout` - Checkout
  - Body: `{ address?, phone? }`

### Orders (Requires Auth)
- `GET /orders` - List user's orders

- `GET /orders/:id` - Get single order

## Frontend Integration

### File Structure
```
frontend/src/
├── config/
│   └── api.config.ts          # API endpoints & configuration
├── types/
│   └── api.types.ts           # TypeScript interfaces
├── lib/
│   └── api-client.ts          # Axios instance with interceptors
├── services/
│   ├── auth.service.ts        # Authentication API calls
│   ├── doctor.service.ts      # Doctor API calls
│   ├── product.service.ts     # Product API calls
│   ├── appointment.service.ts # Appointment API calls
│   ├── cart.service.ts        # Cart API calls
│   ├── order.service.ts       # Order API calls
│   └── index.ts               # Service exports
└── pages/
    ├── Login.tsx              # ✅ Integrated
    ├── Signup.tsx             # ✅ Integrated
    ├── Doctors.tsx            # ✅ Integrated
    ├── Products.tsx           # ✅ Integrated
    └── DashboardAppointments.tsx # ✅ Integrated
```

### Key Components

#### 1. API Client (`lib/api-client.ts`)
- Centralized Axios instance
- Request interceptor adds JWT token
- Response interceptor handles errors globally
- Auto-redirect on 401 Unauthorized

#### 2. Services Layer
Each service encapsulates API calls for a specific resource:
```typescript
// Example usage
import { authService } from '@/services/auth.service'

const response = await authService.login({ email, password })
console.log(response.user)
```

#### 3. TypeScript Types
All API request/response types are defined in `types/api.types.ts` matching backend schemas.

## Authentication Flow

1. **Login/Signup**:
   - User submits credentials
   - Service calls API
   - JWT token stored in localStorage
   - User redirected to dashboard

2. **Authenticated Requests**:
   - API client auto-adds `Authorization: Bearer <token>` header
   - Backend middleware validates token
   - Returns user-specific data

3. **Token Expiry**:
   - 401 response triggers auto-logout
   - Token cleared from localStorage
   - User redirected to login

## State Management Pattern

Each page follows this pattern:
```typescript
const [data, setData] = useState<Type[]>([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState<string | null>(null)

useEffect(() => {
  const fetchData = async () => {
    try {
      const result = await service.getData()
      setData(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  fetchData()
}, [])
```

## Error Handling

### Backend Errors
- 400: Bad Request (validation errors)
- 401: Unauthorized (auth required)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 500: Server Error

### Frontend Handling
- All errors caught in try-catch blocks
- User-friendly error messages displayed
- Network errors handled gracefully
- Loading states prevent multiple requests

## Security Considerations

1. **JWT Storage**: Tokens stored in localStorage (consider httpOnly cookies for production)
2. **CORS**: Backend configured with `ALLOWED_ORIGINS` environment variable
3. **Input Validation**: Backend validates all inputs
4. **Password Hashing**: bcrypt with salt rounds = 10
5. **Token Expiry**: JWT expires in 7 days

## Deployment Considerations

### Environment Variables

**Backend (.env)**:
```
MONGO_URI=<production-mongodb-uri>
JWT_SECRET=<strong-random-secret>
PORT=5000
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

**Frontend (.env)**:
```
VITE_API_BASE_URL=https://your-backend-api.com
```

### CORS Configuration
Update backend `ALLOWED_ORIGINS` to include production frontend URL.

## Testing the Integration

### 1. Start Both Servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 2. Test Authentication
- Navigate to http://localhost:3000/signup
- Create an account
- Check browser localStorage for JWT token
- Navigate to /dashboard (should be accessible)

### 3. Test Doctors List
- Navigate to /doctors
- Should fetch and display doctors from database

### 4. Test Products
- Navigate to /products
- Should display products with "Add to Cart" button
- Click "Add to Cart" (requires login)

### 5. Test Appointments
- Login first
- Navigate to /dashboard/appointments
- Should display user's appointments

## Common Issues & Solutions

### Issue: CORS Error
**Solution**: Ensure backend `ALLOWED_ORIGINS` includes frontend URL

### Issue: 401 Unauthorized
**Solution**: Check if JWT token is being sent in headers. Clear localStorage and re-login.

### Issue: Module not found (@/ imports)
**Solution**: Ensure TypeScript paths are configured in tsconfig.json:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Issue: Axios not installed
**Solution**: Run `npm install axios` in frontend directory

## Next Steps

### Recommended Enhancements
1. **Context API**: Implement AuthContext for global auth state
2. **React Query**: Replace useState/useEffect with React Query for better caching
3. **Form Validation**: Add Zod or Yup for client-side validation
4. **Toast Notifications**: Replace alerts with toast library (sonner, react-hot-toast)
5. **Loading Skeletons**: Add skeleton loaders instead of basic loading text
6. **Error Boundaries**: Implement React error boundaries
7. **Protected Routes**: Create ProtectedRoute component to guard authenticated pages
8. **Refresh Tokens**: Implement refresh token rotation for better security

### Additional Pages to Integrate
- [ ] BookingPage - Create appointment booking form
- [ ] DashboardProfile - Update user profile
- [ ] AdminContent - Manage products (add/edit/delete)
- [ ] AdminUsers - Manage users
- [ ] FindDoctors - Advanced doctor search with filters
- [ ] QuickRemedies - Fetch remedies from API
- [ ] Cart page - View and manage cart items

## API Documentation
For detailed API documentation, refer to the backend route files:
- `backend/routes/auth.js`
- `backend/routes/doctors.js`
- `backend/routes/products.js`
- `backend/routes/appointments.js`
- `backend/routes/cart.js`
- `backend/routes/orders.js`

## Support
For issues or questions, create an issue in the repository.
