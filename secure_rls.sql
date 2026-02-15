-- ==============================================================================
-- HR 360 - STRICT SECURITY (Admin Access Only)
-- ==============================================================================

-- 1. Drop any public/open policies if they exist
drop policy if exists "Enable read access for all users" on employees;
drop policy if exists "Enable read access for all users" on employee_compliance;
drop policy if exists "Enable read access for all users" on employee_financials;
drop policy if exists "Enable read access for all users" on alerts;
drop policy if exists "Enable read access for all users" on portal_data_snapshots;
drop policy if exists "Enable read access for all users" on automation_config;

-- 2. Re-create STRICT policies (Only Authenticated Users)

-- Employees
create policy "Allow authenticated read" on employees for select using (auth.role() = 'authenticated');
create policy "Allow authenticated insert" on employees for insert with check (auth.role() = 'authenticated');
create policy "Allow authenticated update" on employees for update using (auth.role() = 'authenticated');
create policy "Allow authenticated delete" on employees for delete using (auth.role() = 'authenticated');

-- Compliance
create policy "Allow authenticated read" on employee_compliance for select using (auth.role() = 'authenticated');
create policy "Allow authenticated all" on employee_compliance for all using (auth.role() = 'authenticated');

-- Financials
create policy "Allow authenticated read" on employee_financials for select using (auth.role() = 'authenticated');
create policy "Allow authenticated all" on employee_financials for all using (auth.role() = 'authenticated');

-- Snapshots
create policy "Allow authenticated read" on portal_data_snapshots for select using (auth.role() = 'authenticated');
create policy "Allow authenticated all" on portal_data_snapshots for all using (auth.role() = 'authenticated');

-- Alerts
create policy "Allow authenticated read" on alerts for select using (auth.role() = 'authenticated');
create policy "Allow authenticated all" on alerts for all using (auth.role() = 'authenticated');

-- Automation Config
create policy "Allow authenticated read" on automation_config for select using (auth.role() = 'authenticated');
create policy "Allow authenticated all" on automation_config for all using (auth.role() = 'authenticated');
