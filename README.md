# Ceylon Harvest Capital (Vite + React + Supabase)

This repo is a **clean React** scaffold that follows the requested architecture:

```
src/
  components/
  layouts/
  pages/
  routes/
  services/
  context/
  hooks/
  styles/
  supabaseClient.js
  App.jsx
  main.jsx
```

## 1) Setup

1. Install deps:
   - `npm install`
2. Create `.env` from `.env.example` and set:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Run:
   - `npm run dev`

## 2) Supabase setup (matches your tables)

You already have these tables:
- `users`
- `farmers`, `investors`, `admins`, `auditors`
- `contracts`
- `notifications`

### Important note about authentication

Your `public.users` table has `password_hash`, but **this app uses Supabase Auth** (email + password).
Supabase Auth stores and verifies passwords securely on the server, so the app does **not** use `password_hash`.

By default, the app matches the logged-in Supabase Auth user to your `public.users` row using **email**:

- Supabase Auth session email → `public.users.email`

So you do **not** need to change your schema.

### Optional (recommended) improvement: `auth_user_id`

If you want a stronger mapping (and easier RLS rules), you can add:

```sql
alter table public.users
add column if not exists auth_user_id uuid unique;
```

If that column exists, the app will automatically fill it on signup and prefer it when fetching the user row.


### RLS policies (if you added auth_user_id)

> If you did **not** add `auth_user_id`, keep RLS disabled while developing, or write policies based on JWT email claims. The SQL below assumes `auth_user_id` exists.

Run this in **Supabase SQL Editor** (adjust if you want stricter admin/auditor rules):

```sql
-- Enable RLS
alter table public.users enable row level security;
alter table public.farmers enable row level security;
alter table public.investors enable row level security;
alter table public.admins enable row level security;
alter table public.auditors enable row level security;
alter table public.contracts enable row level security;
alter table public.notifications enable row level security;

-- USERS: user can read/insert/update ONLY their own row
create policy "users_select_own" on public.users
for select using (auth.uid() = auth_user_id);

create policy "users_insert_own" on public.users
for insert with check (auth.uid() = auth_user_id);

create policy "users_update_own" on public.users
for update using (auth.uid() = auth_user_id);

-- ROLE TABLES: user can read/insert their own role row
create policy "farmers_select_own" on public.farmers
for select using (exists (select 1 from public.users u where u.user_id = farmers.user_id and u.auth_user_id = auth.uid()));

create policy "farmers_insert_own" on public.farmers
for insert with check (exists (select 1 from public.users u where u.user_id = farmers.user_id and u.auth_user_id = auth.uid()));

create policy "investors_select_own" on public.investors
for select using (exists (select 1 from public.users u where u.user_id = investors.user_id and u.auth_user_id = auth.uid()));

create policy "investors_insert_own" on public.investors
for insert with check (exists (select 1 from public.users u where u.user_id = investors.user_id and u.auth_user_id = auth.uid()));

create policy "admins_select_own" on public.admins
for select using (exists (select 1 from public.users u where u.user_id = admins.user_id and u.auth_user_id = auth.uid()));

create policy "admins_insert_own" on public.admins
for insert with check (exists (select 1 from public.users u where u.user_id = admins.user_id and u.auth_user_id = auth.uid()));

create policy "auditors_select_own" on public.auditors
for select using (exists (select 1 from public.users u where u.user_id = auditors.user_id and u.auth_user_id = auth.uid()));

create policy "auditors_insert_own" on public.auditors
for insert with check (exists (select 1 from public.users u where u.user_id = auditors.user_id and u.auth_user_id = auth.uid()));

-- CONTRACTS: farmer can read own, investor can read/insert own
create policy "contracts_select_farmer" on public.contracts
for select using (
  exists (
    select 1
    from public.users u
    join public.farmers f on f.user_id = u.user_id
    where u.auth_user_id = auth.uid()
      and f.farmer_id = contracts.farmer_id
  )
);

create policy "contracts_select_investor" on public.contracts
for select using (
  exists (
    select 1
    from public.users u
    join public.investors i on i.user_id = u.user_id
    where u.auth_user_id = auth.uid()
      and i.investor_id = contracts.investor_id
  )
);

create policy "contracts_insert_investor" on public.contracts
for insert with check (
  exists (
    select 1
    from public.users u
    join public.investors i on i.user_id = u.user_id
    where u.auth_user_id = auth.uid()
      and i.investor_id = contracts.investor_id
  )
);

-- NOTIFICATIONS: user reads/updates only their notifications
create policy "notifications_select_own" on public.notifications
for select using (exists (select 1 from public.users u where u.user_id = notifications.user_id and u.auth_user_id = auth.uid()));

create policy "notifications_update_own" on public.notifications
for update using (exists (select 1 from public.users u where u.user_id = notifications.user_id and u.auth_user_id = auth.uid()));
```

## 3) Routing model

- Public: `/`, `/login`, `/register`
- Dashboards (protected + role-based):
  - Farmer: `/farmer`
  - Investor: `/investor`
  - Admin: `/admin`
  - Auditor: `/auditor`