-- 1. Habilitar extensiones necesarias
create extension if not exists "pgcrypto";

-- 2. Crear tablas (si no existen)

-- Services
create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric not null,
  commission_rate numeric not null,
  created_at timestamptz default now()
);

-- Employees
create table if not exists employees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  active boolean default true,
  created_at timestamptz default now()
);

-- Customers
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  vehicle_plate text,
  vehicle_model text,
  created_at timestamptz default now()
);

-- Transactions
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  date timestamptz default now(),
  customer_id uuid references customers(id),
  employee_id uuid references employees(id),
  service_id uuid references services(id),
  price numeric not null,
  commission_amount numeric not null,
  tip_amount numeric default 0,
  payment_method text default 'cash',
  extras jsonb default '[]',
  total_price numeric not null,
  created_at timestamptz default now()
);

-- 3. Habilitar seguridad (RLS)
alter table services enable row level security;
alter table employees enable row level security;
alter table customers enable row level security;
alter table transactions enable row level security;

-- 4. Crear políticas de acceso TOTAL (Lectura y Escritura para todos)

-- Services
drop policy if exists "Public services access" on services;
create policy "Public services access" on services for all using (true) with check (true);

-- Employees
drop policy if exists "Public employees access" on employees;
create policy "Public employees access" on employees for all using (true) with check (true);

-- Customers
drop policy if exists "Public customers access" on customers;
create policy "Public customers access" on customers for all using (true) with check (true);

-- Transactions
drop policy if exists "Public transactions access" on transactions;
create policy "Public transactions access" on transactions for all using (true) with check (true);
