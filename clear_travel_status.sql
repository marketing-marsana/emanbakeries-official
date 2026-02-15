-- Reset travel status for all employees
-- This ensures that only future/active Leave Requests determine this status.
UPDATE public.employees
SET is_outside_kingdom = false;
