-- Add missing columns to employees table
ALTER TABLE employees ADD COLUMN IF NOT EXISTS salary numeric;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS arabic_name text;

-- Update RLS policies to ensure these columns are accessible (though usually RLS is row-level)
-- Just in case, grant permissions if needed (usually automatic for table owner)
