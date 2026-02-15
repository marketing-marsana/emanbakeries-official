-- Create 'leaves' table for tracking employee leave requests and history
create table public.leaves (
    id uuid default uuid_generate_v4() primary key,
    employee_id uuid references public.employees(id) on delete cascade not null,
    start_date date not null,
    end_date date not null,
    leave_type text check (leave_type in ('Annual', 'Sick', 'Unpaid', 'Emergency', 'Other')) default 'Annual',
    status text check (status in ('Pending', 'Approved', 'Rejected', 'Completed')) default 'Pending',
    
    -- Exit/Re-entry Visa Details
    exit_reentry_visa boolean default false,
    visa_duration_days integer,
    visa_expiry_date date,
    
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.leaves enable row level security;

-- Policies
create policy "Enable all access for authenticated users" on public.leaves
    for all using (auth.role() = 'authenticated');

-- Indexes
create index idx_leaves_employee_id on public.leaves(employee_id);
create index idx_leaves_start_date on public.leaves(start_date);
