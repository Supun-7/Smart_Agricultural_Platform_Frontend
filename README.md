<<<<<<< HEAD
# CHC Frontend — Connected to Spring Boot Backend

React frontend for Ceylon Harvest Capital, wired directly to the Spring Boot backend at `localhost:8080`.

## Quick Start

```bash
# 1. Start your Spring Boot backend first (port 8080)
# 2. Then:
=======
# Ceylon Harvest Capital – Frontend

## Overview
Frontend application for Ceylon Harvest Capital Agri-Finance Platform.

Built using:
- React (Vite)
- React Router
- Supabase Auth
- REST API integration
- Modern responsive UI

---

## Tech Stack

- React
- Vite
- JavaScript (ES6+)
- Supabase JS
- CSS

---

## Features

- User authentication
- Role-based dashboard routing
- Farmer dashboard
- Investor dashboard
- Admin dashboard
- Auditor dashboard
- Responsive design

---

## Environment Variables

Create a `.env` file:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_BASE_URL=
```

---

## Run Locally

```
>>>>>>> a938e3cb5883af6e6745daf3800d14efac09d39a
npm install
npm run dev
```

<<<<<<< HEAD
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
=======
App runs on:
```
http://localhost:5173
```

---

## Architecture

- components/
- pages/
- services/
- routes/
- context/

---

## Deployment

Designed for:
- Vercel
- Netlify

---

## Author
Ceylon Harvest Capital Development Team
>>>>>>> a938e3cb5883af6e6745daf3800d14efac09d39a
