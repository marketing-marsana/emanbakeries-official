-- Employee Deductions Table
-- Stores custom deductions, loans, advances, and other deductions per employee

CREATE TABLE IF NOT EXISTS employee_deductions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    
    -- Deduction Details
    deduction_type VARCHAR(50) NOT NULL, -- 'loan', 'advance', 'penalty', 'insurance', 'custom'
    description TEXT,
    
    -- Financial Details
    total_amount DECIMAL(10, 2) NOT NULL,
    deducted_amount DECIMAL(10, 2) DEFAULT 0,
    monthly_installment DECIMAL(10, 2),
    remaining_amount DECIMAL(10, 2),
    
    -- Scheduling
    start_month VARCHAR(7) NOT NULL, -- YYYY-MM format
    end_month VARCHAR(7),
    is_recurring BOOLEAN DEFAULT false,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'cancelled'
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(100),
    notes TEXT
);

-- Add indexes for better query performance
CREATE INDEX idx_employee_deductions_employee ON employee_deductions(employee_id);
CREATE INDEX idx_employee_deductions_status ON employee_deductions(status);
CREATE INDEX idx_employee_deductions_start_month ON employee_deductions(start_month);

-- Add nationality to employees table if not exists (for GOSI calculation)
-- ALTER TABLE employees ADD COLUMN IF NOT EXISTS nationality VARCHAR(50) DEFAULT 'Saudi Arabia';

-- Comments
COMMENT ON TABLE employee_deductions IS 'Tracks all employee deductions including loans, advances, penalties, and custom deductions';
COMMENT ON COLUMN employee_deductions.deduction_type IS 'Type: loan, advance, penalty, insurance, custom';
COMMENT ON COLUMN employee_deductions.monthly_installment IS 'Fixed monthly amount to deduct (for loans/advances)';
COMMENT ON COLUMN employee_deductions.is_recurring IS 'True if deduction repeats monthly (like insurance)';
