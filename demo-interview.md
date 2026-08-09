# PBCPMS — Demo Interview Q&A

## Pilot Booking & Coupon Payment Management System

---

## Part 1: System Overview

### Q: What is this system about?
**A:** PBCPMS is a full-stack web application where vessel/vehicle owners can request pilot service support for selected shipping routes and pay the service fee using coupons. There are two user roles — Owner and Admin. The system handles the complete lifecycle from vessel registration, booking creation, coupon-based payment, to pilot assignment and service completion.

### Q: What technologies did you use and why?
**A:**
- **Backend:** Spring Boot 3.2.5, Spring Security with JWT, Spring Data JPA, PostgreSQL 16
- **Frontend:** Next.js 14 (App Router), React 18, Tailwind CSS, Recharts for analytics
- **Infrastructure:** Docker Compose with 4 services (PostgreSQL, pgAdmin, Backend, Frontend)
- **Build:** Maven for backend, npm for frontend

I chose Spring Boot because it provides excellent support for modular monolith architecture, built-in security with JWT, and JPA for database operations. Next.js was chosen for the frontend because it offers server-side rendering, a clean App Router structure, and excellent TypeScript support.

### Q: What is the architecture pattern?
**A:** Modular Monolith. The backend is organized into 7 domain modules — User, Vessel, Route, Pilot, Booking, Coupon, and Report. Each module has its own entities, repositories, services, controllers, and DTOs. A shared kernel provides cross-cutting concerns like JWT authentication, exception handling, and common DTOs. This design allows clean domain boundaries while keeping deployment simple.

---

## Part 2: Authentication & Authorization

### Q: How does authentication work?
**A:** The system uses JWT (JSON Web Token) based stateless authentication. When a user logs in with email and password, the backend validates credentials against BCrypt-hashed passwords, generates a JWT token with a 24-hour expiration, and returns it along with user details. The frontend stores the token in localStorage and attaches it as a Bearer token in the Authorization header for every subsequent API request.

### Q: How does role-based access control work?
**A:** Spring Security intercepts every request. Public endpoints like `/api/v1/auth/login` and `/api/v1/auth/register` are permitted without authentication. Admin-only endpoints under `/api/v1/admin/**` require `ROLE_ADMIN`. Owner endpoints like `/api/v1/bookings/my` and `/api/v1/vessels/my` require `ROLE_OWNER`. The `JwtAuthenticationFilter` extracts the user from the token, and Spring Security's `AuthorizationFilter` enforces role checks. The frontend also guards routes — admin pages check `isAdmin()` and owner pages check `isOwner()` from localStorage.

---

## Part 3: Business Flow

### Q: Walk me through the complete booking flow.
**A:**
1. **Owner registers** with email, password, full name, and phone number
2. **Owner adds vessel/vehicle** information — name, type, registration number. Status starts as PENDING
3. **Admin reviews and approves** the vessel
4. **Admin creates routes** with fixed service fees (e.g., Dhaka to Chittagong, $500)
5. **Owner selects an approved vessel and route** on the Create Booking page
6. **System displays the route fee** in a cost breakdown panel
7. **Owner optionally applies a coupon** — the system validates it in real-time (active, not expired, belongs to owner, amount does not exceed fare)
8. **If coupon is valid**, the discount is applied and the total is recalculated. If the coupon amount exceeds the fare, a SweetAlert2 warning is shown
9. **Owner submits the booking** — status becomes PENDING
10. **Admin approves or rejects** the booking
11. **Admin assigns a pilot** (manually from a list, or the system can auto-assign)
12. **Pilot starts and completes the service** — status transitions through ASSIGNED → IN_PROGRESS → COMPLETED
13. **Owner can track the booking status** at any time

### Q: What are the booking statuses and how do they transition?
**A:** The booking follows a strict state machine:
- `PENDING` → `APPROVED` (admin approves) or `REJECTED` (admin rejects)
- `APPROVED` → `ASSIGNED` (pilot is assigned)
- `ASSIGNED` → `IN_PROGRESS` (pilot starts service)
- `IN_PROGRESS` → `COMPLETED` (pilot completes service)
- Terminal states: `COMPLETED`, `REJECTED` (no further transitions)

Invalid transitions throw an `InvalidBookingTransitionException`. This is enforced by the `BookingStateMachine` component which uses an `EnumMap` of allowed transitions.

---

## Part 4: Coupon System

### Q: How does the coupon system work?
**A:** Coupons serve as the payment method. Admin issues coupons to owners with a specific amount, expiry date, and unique code. When an owner applies a coupon to a booking, the `CouponPolicyService` validates 5 rules:
1. Coupon must exist
2. Coupon status must be ACTIVE (not already used)
3. Coupon must not be expired
4. Coupon must belong to the requesting owner
5. Coupon amount must not exceed the route fare (prevents using a $500 coupon on a $200 route)

After validation, the coupon status changes to USED, and the booking's `totalFee` is recalculated as `routeFee - couponAmount`.

### Q: What happens if someone tries to use a coupon with an amount larger than the fare?
**A:** The system rejects it with a clear message: "Coupon amount ($X) exceeds the route fare ($Y). Please use a smaller coupon." On the frontend, a SweetAlert2 warning dialog is displayed. The coupon remains ACTIVE and can be used on a route with a higher fee.

### Q: How is the cost breakdown displayed?
**A:** The Create Booking page has a two-column layout. The left column (8/12 width) contains the booking form. The right column (4/12 width) shows a sticky cost breakdown card with:
- Route Fee: $X.XX
- Coupon Discount: -$X.XX (or $0.00 if no coupon)
- Total Amount: $X.XX (bold, highlighted)

This updates in real-time as the owner selects routes and applies coupons.

---

## Part 5: Vessel Management

### Q: How does vessel approval work?
**A:** Owners submit vessel/vehicle details (name, type, registration number). The vessel starts with PENDING status. Admin sees all vessels with a status filter (All/Pending/Approved/Rejected). Admin can approve or reject with optional notes. Only APPROVED vessels can be used for booking creation. The system validates vessel status before allowing a booking to be created.

### Q: Can admin also add vessels?
**A:** Yes. The admin vessels page has an "Add Vessel" button that opens a modal form. Admin can create vessels directly — useful for registering vessels on behalf of owners or testing.

---

## Part 6: Reporting & Analytics

### Q: What reports are available?
**A:**
- **Admin Dashboard:** Total bookings, total revenue, active pilots, pending vessels, booking trends chart (monthly)
- **Admin Reports:** Date-range filtered booking count (bar chart) and revenue (line chart) using Recharts
- **Owner Dashboard:** Total bookings, pending, completed, active coupons, recent bookings list

### Q: How does the date range filter work on the reports page?
**A:** The admin can select a start date and end date. The frontend sends these as query parameters to the `/api/v1/admin/reports/booking-analytics` endpoint. The backend queries bookings within that date range, aggregates monthly stats (booking count and revenue per month), and returns the data for chart rendering.

---

## Part 7: Technical Implementation

### Q: How is the database structured?
**A:** 7 tables:
- `users` — id, email, password_hash, full_name, phone, role (OWNER/ADMIN)
- `vessels` — id, owner_id (FK), name, type, registration_number, status, admin_notes
- `routes` — id, name, origin, destination, distance_km, fee, is_active
- `pilots` — id, name, email, phone, license_number, is_available
- `bookings` — id, owner_id, vessel_id, route_id, pilot_id (nullable), coupon_id (nullable), status, total_fee
- `booking_events` — id, booking_id, from_status, to_status, changed_by, note (audit trail)
- `coupons` — id, code, owner_id, amount, status, issued_at, used_at, expires_at

### Q: How do you handle errors?
**A:** A global exception handler (`@RestControllerAdvice`) catches all exceptions and returns consistent JSON responses with `success: false`, a human-readable message, and timestamp. Specific exceptions like `ResourceNotFoundException` (404), `BadRequestException` (400), `DuplicateResourceException` (409), and coupon-specific exceptions have dedicated handlers. A catch-all `Exception` handler logs the full stack trace and returns a generic "An unexpected error occurred" message.

### Q: How is the frontend structured?
**A:** Next.js 14 App Router with 17 pages organized by role:
- Public: `/login`, `/register`
- Owner: `/dashboard`, `/vessels`, `/routes`, `/bookings`, `/bookings/new`, `/coupons`
- Admin: `/admin`, `/admin/vessels`, `/admin/routes`, `/admin/pilots`, `/admin/coupons`, `/admin/bookings`, `/admin/reports`

Each role section has its own `layout.tsx` that guards access. Reusable components include `DataTable`, `StatusBadge`, `StatsCard`, `Modal`, `LoadingSpinner`, `Layout` (sidebar + navbar), and `Sidebar`.

### Q: How does Docker Compose orchestrate the services?
**A:** 4 services:
- `postgres` — PostgreSQL 16 with health checks, data persisted in a named volume
- `pgadmin` — Database management UI on port 5050
- `backend` — Spring Boot app built with multi-stage Dockerfile (Maven build → JRE runtime), depends on postgres being healthy
- `frontend` — Next.js standalone build, depends on backend

Backend connects to postgres via JDBC URL `jdbc:postgresql://postgres:5432/pbcpms`. Frontend is hardcoded to call `http://localhost:8080` (the browser's perspective).

### Q: What is the seed data?
**A:** The `DataInitializer` component runs on startup and creates:
- 2 users: admin (`admin@pbcpms.com` / `admin123`) and owner (`owner@pbcpms.com` / `owner123`)
- 3 vessels (2 approved, 1 pending)
- 5 routes (Dhaka-Chittagong $500, Dhaka-Sylhet $350, Chittagong-Cox's Bazar $250, Dhaka-Rajshahi $400, Dhaka-Khulna $300)
- 3 pilots (2 available, 1 unavailable)
- 10 coupons ($100-$1000) issued to the owner
- 5 bookings in various states (PENDING, APPROVED, ASSIGNED, IN_PROGRESS, COMPLETED)

---

## Part 8: UI/UX Features

### Q: What UI features does the frontend have?
**A:**
- **Dark/Light mode toggle** — persisted in localStorage, applied via Tailwind's `dark:` class strategy
- **Responsive sidebar** — fixed 256px width, active state highlighting with prefix matching for nested routes
- **Real-time cost breakdown** — sticky card showing route fee, coupon discount, and total
- **SweetAlert2 dialogs** — for coupon validation feedback (success/warning/error)
- **Status badges** — color-coded pills for booking statuses (yellow=PENDING, green=APPROVED, blue=ASSIGNED, purple=IN_PROGRESS, green=COMPLETED, red=REJECTED)
- **Data tables** — reusable component with column rendering and empty state
- **Charts** — Recharts for booking trends (LineChart), analytics (BarChart + LineChart)
- **Modal forms** — for adding vessels, routes, pilots, and coupons

### Q: How did you handle the coupon validation UX?
**A:** When the owner enters a coupon code and clicks "Apply", the frontend calls a validation endpoint that checks all 5 rules without actually consuming the coupon. If valid, a success dialog shows the discount amount and the cost breakdown updates. If invalid (expired, wrong owner, amount exceeds fare), a warning dialog explains why. The coupon is only actually consumed when the booking is created and the apply-coupon API is called.

---

## Part 9: Security Considerations

### Q: What security measures are in place?
**A:**
- Passwords are hashed with BCrypt
- JWT tokens expire after 24 hours
- Stateless session management (no server-side sessions)
- CORS configured to allow only `http://localhost:3000`
- Role-based access control on both backend (Spring Security) and frontend (route guards)
- Input validation with `@Valid` and Bean Validation annotations
- SQL injection prevented by JPA parameterized queries
- Global exception handler prevents stack trace leakage

---

## Part 10: Deployment & Running

### Q: How do you run the project?
**A:**
```bash
docker compose up --build
```
This builds both backend (Maven + Java 21) and frontend (Node 20 + Next.js), starts PostgreSQL, pgAdmin, and connects everything. Services are available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html
- pgAdmin: http://localhost:5050

### Q: What are the demo credentials?
**A:**
- **Admin:** `admin@pbcpms.com` / `admin123`
- **Owner:** `owner@pbcpms.com` / `owner123`

---

## Part 11: Challenges & Decisions

### Q: What was the hardest part of this project?
**A:** The booking state machine and coupon validation logic. The booking has 6 states with strict transition rules, and the coupon system has 5 validation rules that must all pass. Getting the timing right — creating the booking first, then applying the coupon, and rolling back if either fails — required careful transactional design.

### Q: Why did you choose modular monolith over microservices?
**A:** For a project of this scope, microservices would add unnecessary complexity — service discovery, distributed transactions, network latency between services. The modular monolith gives clean domain boundaries (each module is self-contained) while keeping deployment simple (one JAR, one database). If the system needs to scale, individual modules can be extracted into microservices later.

### Q: What would you improve with more time?
**A:**
- Add a pilot-facing portal where pilots can see their assigned bookings and update status
- Implement real-time notifications with WebSocket for booking status changes
- Add payment gateway integration as an alternative to coupons
- Implement batch coupon issuance and expiration management
- Add unit and integration tests for the booking and coupon flows
- Add API rate limiting and request throttling

---

*Generated for the PBCPMS demo interview — Pilot Booking & Coupon Payment Management System*
