-- Create table to track offboarding workflow steps
CREATE TABLE IF NOT EXISTS public.offboarding_progress (
    employee_id UUID PRIMARY KEY REFERENCES public.employees(id) ON DELETE CASCADE,
    qiwa_removed BOOLEAN DEFAULT FALSE,
    gosi_removed BOOLEAN DEFAULT FALSE,
    mudad_removed BOOLEAN DEFAULT FALSE,
    muqeem_removed BOOLEAN DEFAULT FALSE,
    notes TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.offboarding_progress ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow authenticated users to read offboarding" ON public.offboarding_progress FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert offboarding" ON public.offboarding_progress FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update offboarding" ON public.offboarding_progress FOR UPDATE TO authenticated USING (true);

-- Ensure employees table has status column (if not already handled by logic, just explicit check)
-- Ideally we rely on existing text column logic, but let's default new status to 'Offboarding' when inserted here if needed.
