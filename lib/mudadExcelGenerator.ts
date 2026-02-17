import ExcelJS from 'exceljs';

interface PayrollRecord {
    employee_id: string;
    employee_name: string;
    employee_position: string;
    basic_salary: number;
    allowances: number;
    deductions: number;
    net_salary: number;
    iqama_number?: string;
    iban?: string;
}

/**
 * Generates a Mudad-format Excel file for payroll
 * This matches the government portal format exactly
 */
export async function generateMudadPayrollExcel(
    payrollData: PayrollRecord[],
    month: string,
    employerNumber: string = '09-4000319'
): Promise<Blob> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Payroll');

    // Set up column widths to match Mudad format
    worksheet.columns = [
        { key: 'serialNo', width: 8 },
        { key: 'iqamaNumber', width: 15 },
        { key: 'employeeName', width: 30 },
        { key: 'basicSalary', width: 12 },
        { key: 'housingAllowance', width: 12 },
        { key: 'otherAllowances', width: 12 },
        { key: 'totalSalary', width: 12 },
        { key: 'deductions', width: 12 },
        { key: 'netSalary', width: 12 },
        { key: 'iban', width: 25 },
        { key: 'nationality', width: 12 }
    ];

    // Add header row with Mudad standard format
    const headerRow = worksheet.addRow([
        'No.',
        'Iqama Number',
        'Employee Name',
        'Basic Salary',
        'Housing Allowance',
        'Other Allowances',
        'Total Salary',
        'Deductions',
        'Net Salary',
        'IBAN',
        'Nationality'
    ]);

    // Style the header row
    headerRow.font = { bold: true, size: 11, name: 'Arial' };
    headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD9E1F2' } // Light blue background
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 25;

    // Add borders to header
    headerRow.eachCell((cell) => {
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
    });

    // Add data rows
    payrollData.forEach((record, index) => {
        const row = worksheet.addRow({
            serialNo: index + 1,
            iqamaNumber: record.iqama_number || '',
            employeeName: record.employee_name || '',
            basicSalary: record.basic_salary || 0,
            housingAllowance: 0, // Can be extracted from allowances if separated
            otherAllowances: record.allowances || 0,
            totalSalary: (record.basic_salary || 0) + (record.allowances || 0),
            deductions: record.deductions || 0,
            netSalary: record.net_salary || 0,
            iban: record.iban || '',
            nationality: 'Saudi Arabia' // Default, can be customized
        });

        // Style data rows
        row.font = { size: 10, name: 'Arial' };
        row.alignment = { vertical: 'middle' };

        // Format number cells
        row.getCell('basicSalary').numFmt = '#,##0.00';
        row.getCell('housingAllowance').numFmt = '#,##0.00';
        row.getCell('otherAllowances').numFmt = '#,##0.00';
        row.getCell('totalSalary').numFmt = '#,##0.00';
        row.getCell('deductions').numFmt = '#,##0.00';
        row.getCell('netSalary').numFmt = '#,##0.00';

        // Center align serial number
        row.getCell('serialNo').alignment = { horizontal: 'center', vertical: 'middle' };

        // Add borders
        row.eachCell((cell) => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });
    });

    // Add total row at the bottom
    const totalRow = worksheet.addRow({
        serialNo: '',
        iqamaNumber: '',
        employeeName: 'TOTAL',
        basicSalary: payrollData.reduce((sum, r) => sum + (r.basic_salary || 0), 0),
        housingAllowance: 0,
        otherAllowances: payrollData.reduce((sum, r) => sum + (r.allowances || 0), 0),
        totalSalary: payrollData.reduce((sum, r) => sum + (r.basic_salary || 0) + (r.allowances || 0), 0),
        deductions: payrollData.reduce((sum, r) => sum + (r.deductions || 0), 0),
        netSalary: payrollData.reduce((sum, r) => sum + (r.net_salary || 0), 0),
        iban: '',
        nationality: ''
    });

    // Style total row
    totalRow.font = { bold: true, size: 11, name: 'Arial' };
    totalRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFCE4D6' } // Light orange background
    };
    totalRow.alignment = { vertical: 'middle', horizontal: 'right' };

    // Format total row numbers
    totalRow.getCell('basicSalary').numFmt = '#,##0.00';
    totalRow.getCell('housingAllowance').numFmt = '#,##0.00';
    totalRow.getCell('otherAllowances').numFmt = '#,##0.00';
    totalRow.getCell('totalSalary').numFmt = '#,##0.00';
    totalRow.getCell('deductions').numFmt = '#,##0.00';
    totalRow.getCell('netSalary').numFmt = '#,##0.00';

    // Add borders to total row
    totalRow.eachCell((cell) => {
        cell.border = {
            top: { style: 'double' },
            left: { style: 'thin' },
            bottom: { style: 'double' },
            right: { style: 'thin' }
        };
    });

    // Freeze the header row
    worksheet.views = [
        { state: 'frozen', xSplit: 0, ySplit: 1 }
    ];

    // Generate buffer and return as Blob
    const buffer = await workbook.xlsx.writeBuffer();
    return new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
}

/**
 * Downloads the generated Excel file
 */
export function downloadExcelFile(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

/**
 * Generates the filename in Mudad format
 * Format: EMPLOYER_NUMBER_MONTH_YEAR.xlsx
 * Example: 09-4000319_01_2026.xlsx
 */
export function generateMudadFilename(month: string, employerNumber: string = '09-4000319'): string {
    // month is in YYYY-MM format, convert to MM_YYYY
    const [year, monthNum] = month.split('-');
    return `${employerNumber}_${monthNum}_${year}.xlsx`;
}
