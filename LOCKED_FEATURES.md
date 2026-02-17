# 🔒 LOCKED FEATURES & DO NOT TOUCH ZONES

This file serves as a strict guideline for the AI assistant to prevent regression of critical established features.

## 🛑 STRICT RULES
1. **Check this file** before making modifications to the listed files.
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
