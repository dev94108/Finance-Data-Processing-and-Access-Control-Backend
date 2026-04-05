# Finance Data Processing and Access Control Backend

A backend API for a finance dashboard system built with Node.js, Express, and MongoDB. The project supports role-based access control, financial record management, and dashboard analytics.

---

## Tech Stack

- Node.js + Express
- MongoDB with Mongoose
- JWT for authentication
- express-validator for input validation
- express-rate-limit for rate limiting
- bcryptjs for password hashing

---

## Project Structure

```
finance-backend/
├── src/
│   ├── config/
│   │   ├── db.js
│   │   └── rateLimiter.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── recordController.js
│   │   └── dashboardController.js
│   ├── middlewares/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── validate.js
│   ├── models/
│   │   ├── User.js
│   │   └── FinancialRecord.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── recordRoutes.js
│   │   └── dashboardRoutes.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── userService.js
│   │   ├── recordService.js
│   │   └── dashboardService.js
│   ├── utils/
│   │   └── seedAdmin.js
│   ├── app.js
│   └── server.js
├── .env
├── package.json
└── README.md
```

---

## Getting Started

Make sure you have Node.js v18+ and a MongoDB instance ready (local or Atlas).

```bash
# Install dependencies
npm install

# Set up your environment variables (see below)
# then start the server
npm start

# or with auto-reload during development
npm run dev
```

---

## Environment Variables

Create a `.env` file in the root and fill in the following:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

ADMIN_NAME=Super Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=yourStrongPassword
```

The admin credentials here are used to seed a default admin account on every server startup. If the account already exists it won't be duplicated, it just checks and moves on.

---

## How Authentication Works

JWT tokens are issued on login and must be sent in the Authorization header as a Bearer token on all protected routes.

One thing worth noting is that the token includes both the user's id and their role. On every request the middleware checks if the role in the token matches what's currently in the database. So if an admin changes someone's role, their existing token stops working immediately and they have to log in again to get a fresh one. This way there's no need for a token blacklist.

---

## Roles and Permissions

There are three roles in the system:

**viewer** — can only read financial records. No access to dashboard analytics, no write operations.

**analyst** — can read records and access all dashboard analytics including summaries, trends, and category breakdowns.

**admin** — full access. Can manage users, create and modify financial records, and access everything.

Self-registration always creates a viewer account. Admins create other users (including other admins) directly through the user management API. There is no way to self-register as an admin or analyst.

---

## Default Admin

A default admin is seeded automatically when the server starts using the credentials in `.env`. This is the entry point into the system. From there the admin can log in and create more users with whatever roles are needed.

If the default admin account somehow gets deactivated it will be restored on the next server restart.

---

## Soft Deletes

Both users and financial records use soft deletes rather than permanent removal.

For records, a deleted flag is set to true and the record is excluded from all queries going forward. For users, the account is deactivated by setting isActive to false which immediately blocks login. The user document stays in the database so that financial records created by that user still have a valid reference and no data integrity issues come up.

---

## Rate Limiting

Two limiters are in place. All routes are covered by a global limiter of 100 requests per 15 minutes. The login and register endpoints have a stricter limit of 10 requests per 15 minutes per IP to reduce brute force risk.

---

## API Overview

All responses follow this structure:

```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

Errors look like this:

```json
{
  "success": false,
  "message": "Something went wrong"
}
```

Validation errors include a breakdown:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "amount", "message": "Amount must be a positive number" }
  ]
}
```

---

### Auth

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /api/auth/register | Public | Register a new account (always viewer) |
| POST | /api/auth/login | Public | Login and receive a JWT token |
| GET | /api/auth/me | Any logged in user | Get your own profile |

---

### Users

All user management routes require admin access.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/users | Create a user with a specified role |
| GET | /api/users | List all users (paginated) |
| GET | /api/users/:id | Get a single user |
| PUT | /api/users/:id | Update name, role, or active status |
| DELETE | /api/users/:id | Deactivate a user (soft delete) |

---

### Financial Records

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /api/records | Admin | Create a record |
| GET | /api/records | All roles | List records with filters and pagination |
| GET | /api/records/:id | All roles | Get a single record |
| PUT | /api/records/:id | Admin | Update a record |
| DELETE | /api/records/:id | Admin | Soft delete a record |

**Filters available on GET /api/records:**

type, category, startDate, endDate, minAmount, maxAmount, page, limit

---

### Dashboard

Analyst and admin only.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/dashboard/summary | Total income, expenses, net balance |
| GET | /api/dashboard/categories | Totals grouped by category |
| GET | /api/dashboard/recent | Most recent transactions |
| GET | /api/dashboard/trends/monthly | Month by month breakdown for a given year |
| GET | /api/dashboard/trends/weekly | Last 7 days of activity |

---

## Pagination

Any list endpoint accepts page and limit as query params. The response always includes a pagination object:

```json
"pagination": {
  "total": 80,
  "page": 2,
  "limit": 10,
  "totalPages": 8
}
```

---

## Error Codes

| Code | Meaning |
|------|---------|
| 400 | Bad request or validation error |
| 401 | Not authenticated or token invalid/expired |
| 403 | Authenticated but not authorized for this action |
| 404 | Resource not found |
| 409 | Conflict, usually a duplicate email |
| 429 | Rate limit hit |
| 500 | Something went wrong on the server |

---

## A Few Design Decisions Worth Mentioning

**Why include role in the JWT?**
Initially the token only had the user id and the role was always fetched from the database. That works, but it means there's no way to detect a role change mid-session. By including the role in the token and comparing it to the database value on each request, any role change takes effect immediately without needing a token blacklist or refresh token setup.

**Why soft delete users?**
Hard deleting a user would leave orphaned references in the financial records table since each record stores who created it. Soft deleting by setting isActive to false keeps the data consistent and also means the account history is preserved if it ever needs to be reviewed.

**Why is role not accepted during public registration?**
Letting users pick their own role on signup is an obvious privilege escalation issue. All public registrations are locked to viewer. Only an admin can assign analyst or admin roles, either at user creation time or by updating an existing account.
