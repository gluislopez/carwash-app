-- Enable pgcrypto for UUID generation (just in case)
create extension if not exists "pgcrypto";

-- Re-create policies with explicit WRITE permissions
drop policy if exists "Public services access" on services;
create policy "Public services access" on services for all using (true) with check (true);

drop policy if exists "Public employees access" on employees;
create policy "Public employees access" on employees for all using (true) with check (true);

drop policy if exists "Public customers access" on customers;
create policy "Public customers access" on customers for all using (true) with check (true);

drop policy if exists "Public transactions access" on transactions;
create policy "Public transactions access" on transactions for all using (true) with check (true);
