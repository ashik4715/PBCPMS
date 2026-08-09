# Pilot Booking & Coupon Payment Management System (PBCPMS) — Design Spec

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                    │
│              React + Tailwind CSS + shadcn/ui            │
│    ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│    │  Owner   │  │  Admin   │  │ Reports  │            │
│    │Dashboard │  │Dashboard │  │ Dashboard│            │
│    └──────────┘  └──────────┘  └──────────┘            │
└───────────────────────┬─────────────────────────────────┘
                        │ REST API (JWT)
┌───────────────────────┴─────────────────────────────────┐
│                  Backend (Spring Boot)                   │
│              Modular Monolith Architecture               │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────────────┐  │
│  │  User   │ │ Vessel  │ │  Route  │ │   Booking    │  │
│  │ Module  │ │ Module  │ │ Module  │ │   Module     │  │
│  └─────────┘ └─────────┘ └─────────┘ └──────────────┘  │
│  ┌─────────┐ ┌─────────┐ ┌─────────────────────────┐   │
│  │ Coupon  │ │  Pilot  │ │    Report Module        │   │
│  │ Module  │ │ Module  │ │  (Analytics & Stats)    │   │
│  └─────────┘ └─────────┘ └─────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐    │
│  │           Shared Kernel (Auth, Exceptions,      │    │
│  │           JWT, RBAC, DTOs, Utils)               │    │
│  └─────────────────────────────────────────────────┘    │
└───────────────────────┬─────────────────────────────────┘
                        │ JPA/Hibernate
┌───────────────────────┴─────────────────────────────────┐
│                    PostgreSQL                            │
│              (via Docker Compose)                        │
└─────────────────────────────────────────────────────────┘
```

**Pattern:** Modular Monolith — each domain is a separate Spring module with its own entities, services, controllers, and DTOs. Shared kernel provides cross-cutting concerns (auth, exceptions, DTOs).

## 2. Domain Modules

| Module | Entities | Key Responsibilities |
|--------|----------|---------------------|
| **User** | `User`, `Role` | Registration, login, JWT generation/validation, RBAC (OWNER, ADMIN) |
| **Vessel** | `Vessel` | CRUD for vessel/vehicle info, admin approval workflow (PENDING → APPROVED/REJECTED) |
| **Route** | `Route` | Admin CRUD, fixed service fees per route, origin/destination |
| **Pilot** | `Pilot` | Pilot profiles, availability tracking, assignment to bookings |
| **Booking** | `Booking`, `BookingEvent` | State machine, fee calculation, pilot assignment, booking lifecycle |
| **Coupon** | `Coupon` | Issuance by admin, validation rules, usage tracking |
| **Report** | (reads from other modules) | Aggregated analytics, dashboard stats, date-filtered reports, chart data |

## 3. Booking State Machine

```
                    ┌──────────┐
         Owner      │          │  Admin rejects
        submits ───►│ PENDING  │──────────────► REJECTED
                    │          │
                    └────┬─────┘
                         │ Admin approves
                         ▼
                    ┌──────────┐
                    │ APPROVED │
                    └────┬─────┘
                         │ Pilot assigned (auto or manual)
                         ▼
                    ┌──────────┐
                    │ ASSIGNED │
                    └────┬─────┘
                         │ Pilot starts service
                         ▼
                    ┌───────────┐
                    │IN_PROGRESS│
                    └────┬──────┘
                         │ Pilot completes
                         ▼
                    ┌──────────┐
                    │COMPLETED │
                    └──────────┘
```

**Valid transitions:**

| From | To | Trigger |
|------|----|---------|
| PENDING | APPROVED | Admin approves booking |
| PENDING | REJECTED | Admin rejects booking |
| APPROVED | ASSIGNED | Admin assigns pilot (manual) or system auto-assigns |
| ASSIGNED | IN_PROGRESS | Pilot starts service |
| IN_PROGRESS | COMPLETED | Pilot completes service |

**Invalid transitions** throw `InvalidBookingTransitionException`.

## 4. Coupon Validation Rules

```java
CouponPolicyService.validate(Coupon coupon, Owner owner, Route route):
  1. coupon must exist → throw CouponNotFoundException
  2. coupon.status must be ACTIVE → throw CouponAlreadyUsedException
  3. coupon.expiryDate must be >= now → throw CouponExpiredException
  4. coupon.ownerId must match requesting owner → throw CouponOwnershipException
  5. coupon.amount must be >= route.fee → throw InsufficientCouponAmountException
  6. On success: coupon.status → USED, coupon.usedAt → now
```

## 5. API Design (RESTful, versioned)

All endpoints are prefixed with `/api/v1`. Responses follow a consistent format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message",
  "timestamp": "2026-08-09T12:00:00Z"
}
```

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/auth/register` | Register new owner | Public |
| POST | `/api/v1/auth/login` | Login, returns JWT | Public |
| GET | `/api/v1/auth/me` | Get current user profile | Any |

### Owner Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/vessels/my` | List my vessels |
| POST | `/api/v1/vessels` | Add vessel (status: PENDING) |
| GET | `/api/v1/routes` | List active routes |
| POST | `/api/v1/bookings` | Create booking (select vessel + route) |
| POST | `/api/v1/bookings/{id}/apply-coupon` | Apply coupon to booking |
| GET | `/api/v1/bookings/my` | List my bookings |
| GET | `/api/v1/coupons/my` | List my coupons |
| GET | `/api/v1/reports/my-bookings` | My booking stats |

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/vessels?status=PENDING` | List vessels by status |
| PUT | `/api/v1/admin/vessels/{id}/approve` | Approve vessel |
| PUT | `/api/v1/admin/vessels/{id}/reject` | Reject vessel |
| GET | `/api/v1/admin/routes` | List all routes |
| POST | `/api/v1/admin/routes` | Create route |
| PUT | `/api/v1/admin/routes/{id}` | Update route |
| DELETE | `/api/v1/admin/routes/{id}` | Delete route |
| GET | `/api/v1/admin/pilots` | List all pilots |
| POST | `/api/v1/admin/pilots` | Create pilot |
| PUT | `/api/v1/admin/pilots/{id}` | Update pilot |
| DELETE | `/api/v1/admin/pilots/{id}` | Delete pilot |
| PUT | `/api/v1/admin/pilots/{id}/availability` | Toggle availability |
| POST | `/api/v1/admin/coupons/issue` | Issue coupon to owner |
| GET | `/api/v1/admin/coupons` | List all coupons |
| GET | `/api/v1/admin/bookings` | List all bookings |
| PUT | `/api/v1/admin/bookings/{id}/approve` | Approve booking |
| PUT | `/api/v1/admin/bookings/{id}/reject` | Reject booking |
| PUT | `/api/v1/admin/bookings/{id}/assign-pilot` | Assign pilot to booking |
| GET | `/api/v1/admin/reports/dashboard` | Dashboard stats |
| GET | `/api/v1/admin/reports/booking-analytics` | Booking analytics with date filters |

## 6. Database Schema

### users
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGSERIAL | PK |
| email | VARCHAR(255) | UNIQUE NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL |
| full_name | VARCHAR(255) | NOT NULL |
| phone | VARCHAR(50) | |
| role | VARCHAR(20) | NOT NULL (OWNER, ADMIN) |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |

### vessels
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGSERIAL | PK |
| owner_id | BIGINT | FK → users.id |
| name | VARCHAR(255) | NOT NULL |
| type | VARCHAR(100) | NOT NULL (e.g., Vessel, Vehicle) |
| registration_number | VARCHAR(100) | UNIQUE NOT NULL |
| status | VARCHAR(20) | DEFAULT 'PENDING' (PENDING, APPROVED, REJECTED) |
| admin_notes | TEXT | |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |

### routes
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGSERIAL | PK |
| name | VARCHAR(255) | NOT NULL |
| origin | VARCHAR(255) | NOT NULL |
| destination | VARCHAR(255) | NOT NULL |
| distance_km | DECIMAL(10,2) | |
| fee | DECIMAL(10,2) | NOT NULL |
| is_active | BOOLEAN | DEFAULT TRUE |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |

### pilots
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGSERIAL | PK |
| name | VARCHAR(255) | NOT NULL |
| email | VARCHAR(255) | UNIQUE NOT NULL |
| phone | VARCHAR(50) | |
| license_number | VARCHAR(100) | UNIQUE NOT NULL |
| is_available | BOOLEAN | DEFAULT TRUE |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |

### bookings
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGSERIAL | PK |
| owner_id | BIGINT | FK → users.id |
| vessel_id | BIGINT | FK → vessels.id |
| route_id | BIGINT | FK → routes.id |
| pilot_id | BIGINT | FK → pilots.id (nullable) |
| coupon_id | BIGINT | FK → coupons.id (nullable) |
| status | VARCHAR(20) | NOT NULL (PENDING, APPROVED, ASSIGNED, IN_PROGRESS, COMPLETED, REJECTED) |
| total_fee | DECIMAL(10,2) | NOT NULL |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |

### booking_events
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGSERIAL | PK |
| booking_id | BIGINT | FK → bookings.id |
| from_status | VARCHAR(20) | |
| to_status | VARCHAR(20) | NOT NULL |
| changed_by | BIGINT | FK → users.id |
| note | TEXT | |
| created_at | TIMESTAMP | DEFAULT NOW() |

### coupons
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGSERIAL | PK |
| code | VARCHAR(50) | UNIQUE NOT NULL |
| owner_id | BIGINT | FK → users.id |
| amount | DECIMAL(10,2) | NOT NULL |
| status | VARCHAR(20) | DEFAULT 'ACTIVE' (ACTIVE, USED, EXPIRED) |
| issued_at | TIMESTAMP | DEFAULT NOW() |
| used_at | TIMESTAMP | |
| expires_at | TIMESTAMP | NOT NULL |

## 7. Docker Compose Services

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| `postgres` | `postgres:16-alpine` | 5432 | PostgreSQL database |
| `pgadmin` | `dpage/pgadmin4:latest` | 5050 | Database management UI |
| `backend` | Custom (Maven build) | 8080 | Spring Boot REST API |
| `frontend` | Custom (Node build) | 3000 | Next.js application |

**Environment variables for backend:**
- `SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/pbcpms`
- `SPRING_DATASOURCE_USERNAME=pbcpms`
- `SPRING_DATASOURCE_PASSWORD=pbcpms`
- `JWT_SECRET=<generated-secret>`
- `JWT_EXPIRATION=86400000` (24h)

**Health checks:** PostgreSQL via `pg_isready`, backend via `/actuator/health`.

## 8. Frontend Pages

| Page | Route | Role | Features |
|------|-------|------|----------|
| Login | `/login` | Public | Email/password form, JWT stored in localStorage |
| Register | `/register` | Public | Owner registration form |
| Owner Dashboard | `/dashboard` | Owner | Stats cards (total bookings, active coupons), recent bookings, quick actions |
| My Vessels | `/vessels` | Owner | Table of vessels, add button, status badges (Pending/Approved/Rejected) |
| Browse Routes | `/routes` | Owner | Card grid of routes with fees |
| Create Booking | `/bookings/new` | Owner | Select vessel (dropdown), select route (dropdown), see fee, apply coupon input |
| My Bookings | `/bookings` | Owner | Table with status tracking, click for details |
| My Coupons | `/coupons` | Owner | Table of coupons with code, amount, status, expiry |
| Admin Dashboard | `/admin` | Admin | Stats cards (total bookings, revenue, active pilots, pending vessels), charts |
| Vessel Approvals | `/admin/vessels` | Admin | Filterable table, approve/reject buttons with notes |
| Route Management | `/admin/routes` | Admin | CRUD table, add/edit modal |
| Pilot Management | `/admin/pilots` | Admin | CRUD table, toggle availability switch |
| Coupon Management | `/admin/coupons` | Admin | Issue coupon form (select owner, amount, expiry), list all coupons |
| Booking Management | `/admin/bookings` | Admin | Filterable table, approve/reject, assign pilot (auto or manual) |
| Reports | `/admin/reports` | Admin | Charts (bookings over time, revenue, top routes), date range picker, export |

## 9. Sample Data & Demo Credentials

### Admin Account
- Email: `admin@pbcpms.com`
- Password: `admin123`

### Sample Owner Account
- Email: `owner@pbcpms.com`
- Password: `owner123`

### Sample Data
- 5 routes with fees ranging from $50 to $500
- 3 pilots with varying availability
- 10 coupons issued to the sample owner ($100-$1000 value)
- 5 sample bookings in various states

## 10. Error Handling

Global exception handler returns consistent error responses:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "errors": ["field-level error details"],
  "timestamp": "2026-08-09T12:00:00Z"
}
```

**Custom exceptions:**
- `ResourceNotFoundException` — 404
- `BadRequestException` — 400
- `UnauthorizedException` — 401
- `ForbiddenException` — 403
- `DuplicateResourceException` — 409
- `CouponNotFoundException`, `CouponAlreadyUsedException`, `CouponExpiredException`, `CouponOwnershipException`, `InsufficientCouponAmountException`
- `InvalidBookingTransitionException`
- `VesselNotApprovedException`

## 11. Technology Stack Summary

| Layer | Technology |
|-------|------------|
| Backend Framework | Spring Boot 3.x |
| Security | Spring Security + JWT |
| ORM | Spring Data JPA + Hibernate |
| Database | PostgreSQL 16 |
| Frontend | Next.js 14 (App Router) |
| UI Library | React 18 |
| Styling | Tailwind CSS |
| HTTP Client | Axios |
| Charts | Recharts |
| Containerization | Docker + Docker Compose |
| Build (Backend) | Maven |
| Build (Frontend) | npm |
