-- Add column to track travel status from Muqeem
alter table public.employees 
add column if not exists is_outside_kingdom boolean default false;

-- Add index for filtering
create index if not exists idx_employees_outside_kingdom on public.employees(is_outside_kingdom);
