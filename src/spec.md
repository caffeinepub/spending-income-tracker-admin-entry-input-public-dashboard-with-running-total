# Specification

## Summary
**Goal:** Build a spending/income tracker with an admin-only entry flow (Internet Identity) and a public dashboard that shows all entries and a running total income.

**Planned changes:**
- Backend: Add a durable data model in the single Motoko main actor to store income entries (date, ICP amount, ICP token value) and derive income per entry (ICP amount × ICP token value).
- Backend: Expose public (no-auth) query methods to list all entries and to fetch total income as the sum of all derived incomes.
- Backend: Add admin authorization via Internet Identity principals: first authenticated caller becomes admin if unset; admin-only create-entry; allow admin transfer to another principal.
- Frontend: Create a public dashboard page (no login required) showing total income and a table/list of entries with per-entry computed income.
- Frontend: Create an admin panel page with Internet Identity sign-in/out, admin-only add-entry form, access-denied state for non-admins, and post-submit refresh of dashboard data.
- Frontend: Apply a coherent financial-ledger theme with warm neutrals and green accents (avoid blue/purple), consistent across layout, cards, tables, and forms.

**User-visible outcome:** Anyone can open the app to view the running total income and all entries; an authorized admin can sign in with Internet Identity to add new entries, which then appear on the public dashboard with updated totals.
