# Hyper Digital Profile - Unified Employee Data Architecture

This document outlines the architecture for synchronizing employee data from **GOSI**, **Mudad**, **Muqeem**, and **Qiwa** into a single "Hyper Digital Profile" in Supabase.

## 1. Unified Data Table Structure (Supabase)

The core principle is to use the **Identity Number (Iqama/National ID)** as the "Golden Key" to link records across all 4 portals.

### Tables Overview
1.  **`employees`**: The master table containing the most reliable personal info (Name, Nationality, DOB, Position).
    *   *Source of Truth:* Mostly Muqeem for personal details, Qiwa for contract details.
2.  **`employee_compliance`**: Stores expiry dates and legal statuses.
    *   *Source:* Muqeem (Iqama, Passport), Qiwa (Work Permit).
3.  **`employee_financials`**: Stores salary and banking info.
    *   *Source:* GOSI (Basic Wage, Housing), Mudad (Net Salary, IBAN).
4.  **`portal_data_snapshots`**: Stores the raw JSON data from every sync. This allows you to "time travel" and see exactly what the portal said on a specific date.

## 2. The "Hidden Bot" Architecture

Since APIs are not available, we use a "Headless Browser" approach (Puppeteer/Playwright).

### Workflow
1.  **Trigger**: Admin clicks "Sync [Portal Name]" in the HR Dashboard.
2.  **Bot Launch**: The Next.js API route (`/api/sync/gosi`, etc.) launches a Puppeteer instance on the server (or triggers a local worker).
3.  **Login**: The bot navigates to the portal login page and enters stored credentials.
4.  **OTP Interception**:
    *   The portal asks for OTP.
    *   The bot detects the OTP input field and pauses/waits.
    *   The HR Dashboard UI shows a popup: *"Enter OTP sent to mobile ending in... "*.
    *   Admin enters OTP manually.
    *   The UI sends OTP to the running bot instance.
    *   The bot enters OTP and proceeds.
5.  **Extraction**: The bot navigates to the "Employee List" or "Export" page, downloads the CSV/Excel, or scrapes the table data directly.
6.  **normalization**: The backend parses the data, maps it to our Supabase schema, and inserts/updates records based on `identity_number`.
7.  **Discrepancy Check**:
    *   *Scenario:* GOSI says salary is 4000, Mudad says 3500.
    *   *Action:* The system Flags this in `alerts` table as "Salary Mismatch".

## 3. Precautions & Best Practices

### A. Data Integrity
*   **Identity Number Format**: Always store Iqama/ID numbers as **TEXT**, not Numbers. Excel/CSVs often strip leading zeros or convert long numbers to scientific notation (e.g., `1.06E+09`).
*   **Date Formats**:
    *   Muqeem uses `YYYY-MM-DD`.
    *   Qiwa often uses `DD/MM/YYYY`.
    *   GOSI sometimes exports Excel Serial Dates (e.g., `45200`).
    *   *Precaution:* Your import script MUST strictly parse distinct date formats for each portal.
*   **Names**:
    *   English names vary wildly between portals (e.g., "Mohammad", "Mohammed", "Mohd").
    *   *Rule:* Use **Muqeem** as the source of truth for English spelling if possible, or store the name exactly as it appears in the specific portal's raw data column.

### B. Security
*   **IBANs**: Access to `employee_financials` should be restricted via RLS (Row Level Security) to HRAdmins only.
*   **Credentials**: Never store portal passwords in plain text. Use environment variables or encrypted fields in `automation_config`.

### C. Import Mapping (CSV Headers)

| Standard Field | GOSI Header | Mudad Header | Muqeem Header | Qiwa Header |
| :--- | :--- | :--- | :--- | :--- |
| **IDENTITY** | `IDENTIFIER` | `ID` | `Iqama Number` | `Employee ID` |
| **NAME** | `CONTRIBUTOR NAME` | `Name` | `Name` | `Employee name` |
| **SALARY** | `TOTAL WAGE` | `Salary` | N/A | `Salary Amount` |
| **IBAN** | N/A | `IBAN` | N/A | `IBAN` |
| **EXPIRY** | N/A | N/A | `Iqama Expiry Date` | `Work Permit Expiry` |

## 4. Discrepancy Logic

The sync script should run these checks after every import:

1.  **Salary Check**: `ABS(GOSI.total_wage - Mudad.salary) > 0`
    *   *Alert:* "GOSI wage does not match Mudad salary."
2.  **Occupation Check**: `Muqeem.occupation != Qiwa.occupation`
    *   *Alert:* "Visa profession differs from actual contract profession."
3.  **Phone Check**: `Qiwa.mobile != System.phone`
    *   *Alert:* "Employee mobile number updated in Qiwa."

## 5. Next Steps

1.  **Run SQL**: Execute `supabase_schema.sql` in your Supabase Dashboard SQL Editor.
2.  **Populate**: Import your existing 4 CSVs into the `portal_snapshots` or `employees` table using a script (or Supabase's "Import Data" if formatting allows).
3.  **Build Bot**: Create the Puppeteer scripts for each portal in `lib/bots/`.
