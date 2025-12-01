-- Services
create table services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric not null,
  commission_rate numeric not null,
  created_at timestamptz default now()
);

-- Employees
create table employees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  active boolean default true,
  created_at timestamptz default now()
);

-- Customers
create table customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  vehicle_plate text,
  vehicle_model text,
  created_at timestamptz default now()
);

-- Transactions
create table transactions (
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

-- Enable Row Level Security (RLS)
alter table services enable row level security;
alter table employees enable row level security;
alter table customers enable row level security;
alter table transactions enable row level security;

-- Create policies (Public access for MVP)
create policy "Public services access" on services for all using (true);
create policy "Public employees access" on employees for all using (true);
create policy "Public customers access" on customers for all using (true);
create policy "Public transactions access" on transactions for all using (true);
