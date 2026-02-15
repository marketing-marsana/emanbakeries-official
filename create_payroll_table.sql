-- Create payroll_records table to store monthly payroll history
CREATE TABLE IF NOT EXISTS public.payroll_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    month TEXT NOT NULL, -- Format: 'YYYY-MM'
    salary_basic NUMERIC, -- Snapshot of salary at time of generation
    housing_allowance NUMERIC,
    other_allowance NUMERIC,
    deductions NUMERIC,
    total_salary NUMERIC GENERATED ALWAYS AS (COALESCE(salary_basic, 0) + COALESCE(housing_allowance, 0) + COALESCE(other_allowance, 0) - COALESCE(deductions, 0)) STORED,
    working_days INTEGER DEFAULT 30,
    leave_days INTEGER DEFAULT 0,
    final_salary NUMERIC NOT NULL, -- Calculated based on working days
    status TEXT DEFAULT 'Draft', -- 'Draft', 'Final', 'Paid'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.payroll_records ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read/insert/update
CREATE POLICY "Allow authenticated users to read payroll" ON public.payroll_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert payroll" ON public.payroll_records FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update payroll" ON public.payroll_records FOR UPDATE TO authenticated USING (true);

-- Create index for faster queries by month
CREATE INDEX IF NOT EXISTS idx_payroll_month ON public.payroll_records(month);
CREATE INDEX IF NOT EXISTS idx_payroll_employee_id ON public.payroll_records(employee_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_payroll_unique_employee_month ON public.payroll_records(employee_id, month);
