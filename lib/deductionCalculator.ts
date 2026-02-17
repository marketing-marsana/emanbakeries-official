/**
 * Saudi Labor Law Compliant Payroll Deduction Calculator
 * 
 * This module calculates all salary deductions according to Saudi labor law:
 * - GOSI contributions (10% for Saudi nationals on basic salary)
 * - Loans and advances
 * - Custom deductions
 * - Leave without pay
 * - Other statutory deductions
 */

import { supabase } from './supabase';

export interface Employee {
    id: string;
    full_name_en: string;
    salary: number;
    nationality?: string;
    position?: string;
}

export interface LeaveRecord {
    employee_id: string;
    start_date: string;
    end_date: string;
    status: string;
}

export interface EmployeeDeduction {
    id: string;
    employee_id: string;
    deduction_type: string;
    description?: string;
    total_amount: number;
    deducted_amount: number;
    monthly_installment?: number;
    remaining_amount?: number;
    start_month: string;
    end_month?: string;
    is_recurring: boolean;
    status: string;
}

export interface DeductionBreakdown {
    gosi: number;
    leaveDays: number;
    leaveDeduction: number;
    loans: number;
    advances: number;
    penalties: number;
    insurance: number;
    custom: number;
    total: number;
    details: {
        type: string;
        description: string;
        amount: number;
    }[];
}

/**
 * Calculate GOSI deduction according to Saudi labor law
 * - Saudi nationals: 10% of basic salary (employee contribution)
 * - Non-Saudis: 0% (employer pays 2% occupational hazards only)
 */
export function calculateGOSI(baseSalary: number, nationality?: string): number {
    const isSaudi = nationality?.toLowerCase().includes('saudi') ||
        nationality?.toLowerCase().includes('سعود');

    if (isSaudi) {
        // Saudi nationals pay 10% GOSI from basic salary
        return baseSalary * 0.10;
    }

    // Non-Saudi employees don't pay GOSI (employer pays separately)
    return 0;
}

/**
 * Calculate leave deduction for unpaid leave days
 * Formula: (Basic Salary / 30) × Number of Leave Days
 */
export function calculateLeaveDeduction(
    baseSalary: number,
    leaveDays: number
): number {
    const dailyRate = baseSalary / 30;
    return dailyRate * leaveDays;
}

/**
 * Fetch active deductions for an employee in a specific month
 */
export async function getEmployeeDeductions(
    employeeId: string,
    month: string
): Promise<EmployeeDeduction[]> {
    const { data, error } = await supabase
        .from('employee_deductions')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('status', 'active')
        .lte('start_month', month)
        .or(`end_month.is.null,end_month.gte.${month}`);

    if (error) {
        console.error('Error fetching deductions:', error);
        return [];
    }

    return data || [];
}

/**
 * Calculate all deductions for an employee
 */
export async function calculateEmployeeDeductions(
    employee: Employee,
    leaveDays: number,
    month: string
): Promise<DeductionBreakdown> {
    const baseSalary = employee.salary || 0;

    // 1. GOSI Deduction (Saudi nationals only)
    const gosi = calculateGOSI(baseSalary, employee.nationality);

    // 2. Leave Deduction
    const leaveDeduction = calculateLeaveDeduction(baseSalary, leaveDays);

    // 3. Fetch other deductions from database
    const deductions = await getEmployeeDeductions(employee.id, month);

    let loans = 0;
    let advances = 0;
    let penalties = 0;
    let insurance = 0;
    let custom = 0;
    const details: { type: string; description: string; amount: number }[] = [];

    // Add GOSI to details if applicable
    if (gosi > 0) {
        details.push({
            type: 'GOSI',
            description: 'GOSI Contribution (10% of basic salary)',
            amount: gosi
        });
    }

    // Add leave deduction to details if applicable
    if (leaveDeduction > 0) {
        details.push({
            type: 'Leave',
            description: `Unpaid leave deduction (${leaveDays} days)`,
            amount: leaveDeduction
        });
    }

    // Process custom deductions
    deductions.forEach(deduction => {
        const amount = deduction.monthly_installment || deduction.remaining_amount || 0;

        switch (deduction.deduction_type) {
            case 'loan':
                loans += amount;
                details.push({
                    type: 'Loan',
                    description: deduction.description || 'Loan installment',
                    amount
                });
                break;
            case 'advance':
                advances += amount;
                details.push({
                    type: 'Advance',
                    description: deduction.description || 'Salary advance recovery',
                    amount
                });
                break;
            case 'penalty':
                penalties += amount;
                details.push({
                    type: 'Penalty',
                    description: deduction.description || 'Penalty deduction',
                    amount
                });
                break;
            case 'insurance':
                insurance += amount;
                details.push({
                    type: 'Insurance',
                    description: deduction.description || 'Insurance premium',
                    amount
                });
                break;
            case 'custom':
                custom += amount;
                details.push({
                    type: 'Custom',
                    description: deduction.description || 'Other deduction',
                    amount
                });
                break;
        }
    });

    const total = gosi + leaveDeduction + loans + advances + penalties + insurance + custom;

    return {
        gosi,
        leaveDays,
        leaveDeduction,
        loans,
        advances,
        penalties,
        insurance,
        custom,
        total,
        details
    };
}

/**
 * Update deduction records after payroll processing
 */
export async function updateDeductionRecords(
    employeeId: string,
    month: string,
    processedDeductions: EmployeeDeduction[]
): Promise<void> {
    for (const deduction of processedDeductions) {
        const amountDeducted = deduction.monthly_installment || deduction.remaining_amount || 0;
        const newDeductedAmount = (deduction.deducted_amount || 0) + amountDeducted;
        const newRemainingAmount = (deduction.total_amount || 0) - newDeductedAmount;

        const updateData: any = {
            deducted_amount: newDeductedAmount,
            remaining_amount: newRemainingAmount,
            updated_at: new Date().toISOString()
        };

        // Mark as completed if fully paid
        if (newRemainingAmount <= 0 && !deduction.is_recurring) {
            updateData.status = 'completed';
            updateData.end_month = month;
        }

        await supabase
            .from('employee_deductions')
            .update(updateData)
            .eq('id', deduction.id);
    }
}

/**
 * Calculate net salary after all deductions
 */
export function calculateNetSalary(
    baseSalary: number,
    allowances: number,
    totalDeductions: number
): number {
    return baseSalary + allowances - totalDeductions;
}

/**
 * Validate deduction amount according to Saudi labor law
 * Maximum deduction cannot exceed 50% of salary (except for specific cases)
 */
export function validateDeductionAmount(
    baseSalary: number,
    totalDeductions: number
): { valid: boolean; message?: string } {
    const maxDeduction = baseSalary * 0.50; // 50% maximum

    if (totalDeductions > maxDeduction) {
        return {
            valid: false,
            message: `Total deductions (${totalDeductions.toFixed(2)}) exceed 50% of salary (${maxDeduction.toFixed(2)}). This violates Saudi labor law.`
        };
    }

    return { valid: true };
}

/**
 * Get deduction summary for reporting
 */
export function getDeductionSummary(breakdown: DeductionBreakdown): string {
    const parts: string[] = [];

    if (breakdown.gosi > 0) parts.push(`GOSI: ${breakdown.gosi.toFixed(2)}`);
    if (breakdown.leaveDeduction > 0) parts.push(`Leave: ${breakdown.leaveDeduction.toFixed(2)}`);
    if (breakdown.loans > 0) parts.push(`Loans: ${breakdown.loans.toFixed(2)}`);
    if (breakdown.advances > 0) parts.push(`Advances: ${breakdown.advances.toFixed(2)}`);
    if (breakdown.penalties > 0) parts.push(`Penalties: ${breakdown.penalties.toFixed(2)}`);
    if (breakdown.insurance > 0) parts.push(`Insurance: ${breakdown.insurance.toFixed(2)}`);
    if (breakdown.custom > 0) parts.push(`Other: ${breakdown.custom.toFixed(2)}`);

    return parts.join(' | ');
}
