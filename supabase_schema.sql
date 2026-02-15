-- ==============================================================================
-- HR 360 - HYPER DIGITAL PROFILE SCHEMA (Full Reset & Setup)
-- Run this SINGLE file in your Supabase SQL Editor to set up everything.
-- ==============================================================================

-- ⚠️ WARNING: THIS WILL DELETE EXISTING DATA IN THESE TABLES TO ENSURE A CLEAN SLATE ⚠️
-- 1. DROP EXISTING TABLES
DROP TABLE IF EXISTS automation_config CASCADE;
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS portal_data_snapshots CASCADE;
DROP TABLE IF EXISTS employee_financials CASCADE;
DROP TABLE IF EXISTS employee_compliance CASCADE;
DROP TABLE IF EXISTS employees CASCADE;

-- 2. DROP EXISTING INDEXES (To avoid "relation already exists" errors)
DROP INDEX IF EXISTS idx_employees_identity;
DROP INDEX IF EXISTS idx_snapshots_employee_portal;
DROP INDEX IF EXISTS idx_alerts_status;

-- ==============================================================================
-- 3. Enable necessary extensions
-- ==============================================================================
create extension if not exists "uuid-ossp";

-- ==============================================================================
-- 4. Master Employee Table (The "Golden Record")
-- ==============================================================================
create table employees (
    id uuid default uuid_generate_v4() primary key,
    identity_number text unique not null, -- The key that links GOSI, Muqeem, Qiwa, Mudad
    first_name text,
    last_name text,
    arabic_name text,
    full_name_en text, -- Aggregated full name
    nationality text,
    gender text,
    birth_date date,
    email text,
    phone_number text,
    position text,
    salary numeric,
    department text,
    status text default 'Active', -- Active, Terminated, On Leave
    joining_date date,
    company_number text, -- Internal company ID if any
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- 5. Compliance Profile (Muqeem & Qiwa Data)
-- ==============================================================================
create table employee_compliance (
    id uuid default uuid_generate_v4() primary key,
    employee_id uuid references employees(id) on delete cascade unique, -- One compliance record per employee
    
    -- Iqama/ID Details
    iqama_number text,
    iqama_issue_date date,
    iqama_expiry_gregorian date,
    iqama_expiry_hijri text,
    
    -- Passport Details
    passport_number text,
    passport_issue_date date,
    passport_expiry_date date,
    
    -- Contract & Permits (Qiwa)
    contract_status text, -- e.g., 'Valid', 'Expired'
    contract_expiry_date date,
    work_permit_status text,
    work_permit_expiry_date date,
    
    -- Statuses
    border_number text,
    occupation_on_iqama text,
    
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- 6. Financial Profile (GOSI & Mudad Data)
-- ==============================================================================
create table employee_financials (
    id uuid default uuid_generate_v4() primary key,
    employee_id uuid references employees(id) on delete cascade unique, -- One financial record per employee
    
    -- Banking
    iban text,
    bank_name text,
    
    -- Salary Breakdown (GOSI)
    basic_salary numeric default 0,
    housing_allowance numeric default 0,
    other_allowance numeric default 0,
    transport_allowance numeric default 0,
    total_gosi_salary numeric default 0,
    
    -- Salary Breakdown (Contract/Actual)
    contract_basic_salary numeric default 0,
    contract_total_salary numeric default 0,
    
    salary_payment_frequency text default 'Monthly',
    
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- 7. Portal Sync Logs (The "Raw Data" & Cross-Check Source)
-- ==============================================================================
-- This table stores the raw extracted data every time the bot runs.
-- You can use this to compare historical data or debug discrepancies.
create table portal_data_snapshots (
    id uuid default uuid_generate_v4() primary key,
    employee_id uuid references employees(id) on delete cascade,
    portal_source text not null check (portal_source in ('GOSI', 'MUDAD', 'MUQEEM', 'QIWA')),
    sync_date timestamp with time zone default timezone('utc'::text, now()) not null,
    
    -- Store the complete raw JSON row here
    raw_data jsonb,
    
    -- Sync Status
    status text default 'Success', -- 'Success', 'Failed'
    discrepancy_detected boolean default false
);

-- ==============================================================================
-- 8. System Alerts & Notifications
-- ==============================================================================
create table alerts (
    id uuid default uuid_generate_v4() primary key,
    employee_id uuid references employees(id) on delete set null,
    
    alert_type text not null, -- 'EXPIRY', 'DISCREPANCY', 'MISSING_DATA'
    title text not null,
    description text,
    severity text default 'Medium' check (severity in ('Low', 'Medium', 'High', 'Critical')),
    
    status text default 'Open', -- 'Open', 'Acknowledged', 'Resolved'
    due_date date,
    
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- 9. Bot/Automation Configuration
-- ==============================================================================
create table automation_config (
    id uuid default uuid_generate_v4() primary key,
    portal_name text unique not null,
    login_url text not null,
    username_encrypted text, -- Encrypted by app before storing
    password_encrypted text, -- Encrypted by app before storing
    last_sync_status text,
    last_sync_time timestamp with time zone
);

-- ==============================================================================
-- 10. Row Level Security (RLS) - Basic Setup to protect data
-- ==============================================================================
alter table employees enable row level security;
alter table employee_compliance enable row level security;
alter table employee_financials enable row level security;
alter table portal_data_snapshots enable row level security;
alter table alerts enable row level security;
alter table automation_config enable row level security;

-- Policy: Allow full access to authenticated users (adjust as needed for roles)
create policy "Allow all for authenticated" on employees for all using (auth.role() = 'authenticated');
create policy "Allow all for authenticated" on employee_compliance for all using (auth.role() = 'authenticated');
create policy "Allow all for authenticated" on employee_financials for all using (auth.role() = 'authenticated');
create policy "Allow all for authenticated" on portal_data_snapshots for all using (auth.role() = 'authenticated');
create policy "Allow all for authenticated" on alerts for all using (auth.role() = 'authenticated');
create policy "Allow all for authenticated" on automation_config for all using (auth.role() = 'authenticated');

-- ==============================================================================
-- 11. Indexes for Performance
-- ==============================================================================
create index if not exists idx_employees_identity on employees(identity_number);
create index if not exists idx_snapshots_employee_portal on portal_data_snapshots(employee_id, portal_source);
create index if not exists idx_alerts_status on alerts(status);
