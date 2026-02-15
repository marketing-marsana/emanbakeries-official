# Hyper Digital Profile - Import Instructions

Follow these steps to initialize your database and import your employee data from GOSI, Mudad, Muqeem, and Qiwa.

## Prerequisite: Database Setup

1.  Go to your **Supabase Dashboard** (https://supabase.com/dashboard).
2.  Open your project (`hr-360`).
3.  Go to the **SQL Editor** (left sidebar).
4.  Click **New Query**.
5.  **Copy** the entire content of the file `supabase_schema.sql` (located in your project root).
6.  **Paste** it into the SQL Editor.
7.  Click **Run**.
    *   *This will create the necessary tables: `employees`, `employee_compliance`, `employee_financials`, etc.*

## Step 1: Prepare CSV Files

Ensure your CSV files are in the `CSV/` folder in your project root:
-   `CSV/chtgp-Gosi.csv`
-   `CSV/chtgp-Mudad.csv`
-   `CSV/chtgp-Muqeem.csv`
-   `CSV/chtgp-Qiwa.csv`

The import script is configured to read these specific filenames.

## Step 2: Run the Import Script

Open your terminal in VS Code (ensure you are in the `hr-360` directory) and run:

```bash
npx tsx scripts/import_hyper_data.ts
```

### What this script does:
1.  **Reads all 4 CSV files.**
2.  **Identifies unique employees** by matching their ID/Iqama number across files.
3.  **Creates a "Golden Record"** in the `employees` table (combining the best data from each source).
4.  **Populates Compliance Data** (Iqama/Passport expiry, Contract status) into `employee_compliance`.
5.  **Populates Financial Data** (Salary, IBAN) into `employee_financials`.
6.  **Saves Raw Snapshots** of the original CSV rows into `portal_data_snapshots` for audit/history.

## Step 3: Verify Data

After the script finishes:
1.  Go to your app (`http://localhost:3000/employees`).
2.  You should see your real employee list!
3.  Click on an employee to see their detailed profile (Compliance & Financial tabs will now leverage this data if linked correctly in the UI).

## Troubleshooting

-   **"Relation does not exist"**: You didn't run the SQL schema in Supabase. Go back to Prerequisite.
-   **"Permission denied"**: The script uses the `SUPABASE_SERVICE_ROLE_KEY` from `.env.local`. Ensure this key is correct and has admin privileges.
