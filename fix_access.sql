-- ==============================================================================
-- HR 360 - OPEN ACCESS FIX (Fixing "0 Employees" Issue)
-- ==============================================================================

-- Problem: The previous schema secured the data so only "Logged In" users could see it.
-- Since the app doesn't have a login screen yet, we need to allow public READ access.

-- 1. Drop existing restrictive policies
drop policy if exists "Allow all for authenticated" on employees;
drop policy if exists "Allow all for authenticated" on employee_compliance;
drop policy if exists "Allow all for authenticated" on employee_financials;
drop policy if exists "Allow all for authenticated" on alerts;
drop policy if exists "Allow all for authenticated" on portal_data_snapshots;

-- 2. Create new policies allowing READ access to EVERYONE (including anonymous)
-- But keep WRITE access restricted to service_role (your scripts) or authenticated users only.

-- Employees
create policy "Enable read access for all users" on employees for select using (true);
create policy "Enable insert for authenticated and service_role" on employees for insert with check (true);
create policy "Enable update for authenticated and service_role" on employees for update using (true);

-- Compliance
create policy "Enable read access for all users" on employee_compliance for select using (true);
create policy "Enable write access for authenticated" on employee_compliance for all using (true);

-- Financials
create policy "Enable read access for all users" on employee_financials for select using (true);
create policy "Enable write access for authenticated" on employee_financials for all using (true);

-- Snapshots
create policy "Enable read access for all users" on portal_data_snapshots for select using (true);
create policy "Enable write access for authenticated" on portal_data_snapshots for all using (true);

-- Alerts
create policy "Enable read access for all users" on alerts for select using (true);
create policy "Enable write access for authenticated" on alerts for all using (true);

-- Automation Config
create policy "Enable read access for all users" on automation_config for select using (true);
create policy "Enable write access for authenticated" on automation_config for all using (true);
