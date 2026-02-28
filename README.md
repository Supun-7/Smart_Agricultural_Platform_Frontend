# CHC Frontend — Connected to Spring Boot Backend

React frontend for Ceylon Harvest Capital, wired directly to the Spring Boot backend at `localhost:8080`.

## Quick Start

```bash
# 1. Start your Spring Boot backend first (port 8080)
# 2. Then:
npm install
npm run dev
```

Open http://localhost:5173

## API Endpoints Used

| Action   | Method | URL                        | Body                                          |
|----------|--------|----------------------------|-----------------------------------------------|
| Register | POST   | `/api/users/register`      | `{ fullName, email, passwordHash, role }`     |
| Login    | POST   | `/api/users/login`         | `{ email, password }`                         |

> **Note:** The backend stores passwords as plain text in `passwordHash`. The frontend sends the password directly in that field during registration.

## Auth Flow

- After login, the User object returned by the backend is stored in `localStorage` (`chc_user`)
- The Navbar shows the user's name and a Sign Out button when logged in
- Sign Out clears localStorage and returns to Home

## Pages

- `/` — Home (animated landing page)
- `/login` — Login form → POST `/api/users/login`
- `/register` — Register form → POST `/api/users/register`
