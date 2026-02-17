# 🔒 LOCKED FEATURES & DO NOT TOUCH ZONES

This file serves as the strict registry and Standard Operating Procedure (SOP) for preventing regression in the HR-360 project.

## 🛠️ STANDARD OPERATING PROCEDURE (SOP)
**Requirement**: For every completed feature in this application, the AI Assistant MUST follow this locking protocol:

1.  **File Header**: Add the `// 🛑 LOCKED FEATURE WARNING 🛑` block to the top of any critical source file (`.tsx`, `.ts`).
2.  **Registry Update**: Add a new entry to the "LOCKED FEATURE LIST" below, documenting the file path, feature description, and strict constraints.
3.  **Commit**: Commit the registry update immediately to `main` to enforce the lock.

## 🛑 STRICT RULES
1. **Check this file** before making modifications to ANY file listed below.
2. **DO NOT MODIFY** the features listed below without explicit user permission.
3. **DO NOT REMOVE** logical blocks associated with these features during refactors.
4. **DO NOT CHANGE** the UI layout of these features unless specifically asked.

## 📋 LOCKED FEATURE LIST

### 1. Employee Profile - Government Portal Details
- **File**: `app/employees/page.tsx`
- **Feature**: "View Portal Details" Button & Expanded Compliance View
- **Description**: Displays raw compliance data from Qiwa, Muqeem, GOSI, and Mudad tables.
- **Constraints**:
  - MUST fetch from `portal_data_snapshots` table (source of truth).
  - MUST display raw data fields dynamically (except filtered IDs).
  - MUST NOT link to external government websites.
  - MUST NOT be hidden or removed during UI redesigns.
  - **Status**: LOCKED (Confirmed by User Request on 2026-02-17)
