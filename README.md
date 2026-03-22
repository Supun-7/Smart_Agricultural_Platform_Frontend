<div align="center">

<img src="src/assets/logo.png" alt="Ceylon Harvest Capital Logo" width="180"/>

# 🌾 Ceylon Harvest Capital — Frontend

**A smart agri-finance platform connecting Sri Lankan farmers with investors**

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

[🚀 Live Demo](#) • [📖 Docs](#) • [🐛 Report Bug](issues) • [💡 Request Feature](issues)

</div>

---

## 📌 Overview

**Ceylon Harvest Capital (CHC)** is an agri-finance platform that connects verified Sri Lankan farmers with smart investors. Farmers gain access to capital, while investors earn transparent returns — all through a secure, performance-based system.

> 340+ Verified Farms &nbsp;•&nbsp; Rs 48M+ Capital Deployed &nbsp;•&nbsp; 9 Provinces Covered &nbsp;•&nbsp; 24% Avg Annual ROI

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Role-Based Auth** | Separate dashboards for Farmer, Investor, Admin, and Auditor |
| 🌱 **Farmer Dashboard** | Manage farm data, contracts, and track progress |
| 💰 **Investor Dashboard** | Browse opportunities, manage portfolio and reports |
| 🛡️ **Admin Panel** | User management and system oversight |
| 📋 **Auditor View** | Transparency reports and verification workflows |
| 🌍 **Google Auth** | One-click sign in with Google |
| 📱 **Responsive UI** | Mobile-first design with animated landing page |
| ⚡ **Fast & Modern** | Vite-powered with instant HMR |

---

## 🛠️ Tech Stack

```
Frontend     → React 18 + Vite 5
Routing      → React Router v6
Auth         → Supabase Auth + Google OAuth
HTTP Client  → Axios
Styling      → CSS (custom, responsive)
```

---

## 📁 Project Structure

```
src/
├── assets/              # Images, logos, slide photos
│   └── slides/          # Landing page background images
├── components/          # Reusable UI components
│   ├── Navbar.jsx
│   ├── FileUploadField.jsx
│   ├── ErrorBanner.jsx
│   ├── Preloader.jsx
│   └── investor/        # Investor-specific components
├── context/             # React Context (Auth)
├── hooks/               # Custom hooks (useAuth, useDashboard...)
├── layouts/             # Per-role layout wrappers
│   ├── AdminLayout.jsx
│   ├── FarmerLayout.jsx
│   ├── InvestorLayout.jsx
│   └── AuditorLayout.jsx
├── pages/               # All route pages
│   ├── Home.jsx         # Animated landing page
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── FarmerDashboard.jsx
│   ├── admin/
│   ├── investor/
│   └── auditor/
└── App.jsx
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ ([download](https://nodejs.org))
- **npm** v9+
- A Supabase project (free tier works!)

### 1. Clone the repo

```bash
git clone https://github.com/your-username/chc-frontend.git
cd chc-frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:8080
```

> 💡 Get your Supabase credentials from [app.supabase.com](https://app.supabase.com) → Project Settings → API

### 4. Start the dev server

```bash
npm run dev
```

App runs at: **http://localhost:5173** 🎉

---

## 📜 Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run preview   # Preview production build locally
```

---

## 🔗 API Endpoints

Connects to the Spring Boot backend at `localhost:8080`:

| Action | Method | Endpoint | Body |
|---|---|---|---|
| Register | `POST` | `/api/users/register` | `{ fullName, email, passwordHash, role }` |
| Login | `POST` | `/api/users/login` | `{ email, password }` |

---

## 🔐 Auth Flow

```
Login / Google OAuth
        ↓
  Supabase Auth
        ↓
  Role Check (Farmer / Investor / Admin / Auditor)
        ↓
  Role-based Dashboard Redirect
```

- Session is stored in `localStorage` under the key `chc_user`
- Sign Out clears localStorage and redirects to Home

---

## 🌐 Deployment

### Vercel (Recommended)

```bash
npm run build
# Deploy the dist/ folder to Vercel
```

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

> ⚠️ Don't forget to add your environment variables in the deployment platform's settings!

---

## 🤝 Contributing

1. Fork the repo
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 👥 Team

**Ceylon Harvest Capital Development Team**

> Built with ❤️ for Sri Lankan farmers and investors

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**⭐ Star this repo if you found it useful!**

</div>
