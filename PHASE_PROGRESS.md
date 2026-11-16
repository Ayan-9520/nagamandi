# Naga Mandi OS — phase progress

## Phase 1 — Application shell and demonstration dashboard

Status: accepted. Phase 2 was requested after this shell.

The app is a frontend-only React desk. Every figure and saved note is a demonstration record in the browser. Krishora is not included.

### Screens

- Operations desk at `/` with KPI cards, arrival chart, trade-volume chart, licence-status chart, and a sortable gate-lot table.
- Settings at `/settings` for theme, desk label, dashboard sample, and clearing saved browser data.
- Operating-map pages for the modules that are not in this phase. Each page names the related SOP and does not offer a workflow.
- Not-found page for unknown addresses.

### Routes

| Route | Screen |
| --- | --- |
| `/` | Dashboard |
| `/settings` | Settings |
| `/stakeholders` | Later phase |
| `/licences` | Later phase |
| `/arrivals` | Later phase |
| `/trading` | Later phase |
| `/finance` | Later phase |
| `/warehouses` | Later phase |
| `/cold-storage` | Later phase |
| `/post-harvest` | Later phase |
| `/parking` | Later phase |
| `/facilities` | Later phase |
| `/compliance` | Later phase |
| `/reports` | Later phase |

### Functionality

- Collapsible sidebar, persisted in this browser, and a sheet navigation below the desktop breakpoint.
- Top bar with module and lot search (`Ctrl K`), demonstration notices, a DEMO DATA explanation, and a user menu.
- Light and dark themes.
- Breadcrumbs and document titles.
- Reusable table, cards, filters, dialogs, empty, loading, and error states.
- Dashboard filters for yard, commodity, and arrival window. A sample control shows the operating, empty, and error states.
- Lot dialog saves a desk note in `localStorage`.
- Vite serves `http://localhost:5173` with `strictPort`.

### Tests

- `npm install` completed.
- `npm run build` (`tsc -b && vite build`) completed with exit code 0.
- Dev server started at `http://localhost:5173`.
- Browser check: homepage rendered the demonstration KPIs and charts; mobile navigation opened Licences and returned home; a lot note was saved in browser storage; the sidebar collapsed; dark theme switched on and back to light.

## Phase 2 — Demo authentication and role dashboards

Status: accepted. Phase 3 was requested after this simulation.

Sign-in and permissions are a simulation in this browser. They do not identify an officer or protect a record. There is no backend.

### Screens

- Login at `/login`, with a published password and a desk picker.
- Forgot password at `/forgot-password`. It shows the published password and desk ids. It does not send mail or pretend to reset an account.
- Role selection at `/roles`.
- Profile at `/profile`.
- Dashboard at `/`, with role widgets, pending tasks, recent activity, and shortcuts. Super Admin and Mandi Manager also keep the yard sample.
- Unauthorized access at `/unauthorized` when a signed-in role opens a module outside its simulated list.

### Routes

Shared signed-in routes: `/`, `/profile`, `/roles`, `/unauthorized`, `/settings`.

Module routes stay on the operating map. A role that is not allowed to open one is sent to `/unauthorized`. Unknown addresses still use the not-found page.

### Functionality

- Thirteen demonstration desks, one password: `demo-mandi`.
- Roles: Super Admin, Mandi Manager, Licence Officer, Accounts Officer, Aadathiya, Farmer / Seller, Buyer, Warehouse Operator, Cold Storage Operator, FLP Operator, Parking / Transport Operator, Facility Operator, Inspector / Auditor.
- Permissions live in `src/mocks/permissions.ts`. The sidebar, search, and route guard read that list.
- The selected desk is stored in `localStorage` under `naga-mandi-os.session` and restored on refresh.
- A gold notice on the sign-in screens and inside the shell says the session is simulated.
- Opening a task or activity explains that it does not start a procedure.

### Tests

- `npm run build` (`tsc -b && vite build`) completed with exit code 0.
- Wrong password stays on the login screen and shows an error. The published password starts a session.
- Each of the 13 roles was switched from Role selection. The visible sidebar matched that role’s modules plus Dashboard and Settings. A shortcut opened the matching module map. Pending tasks, recent activity, and shortcuts were present. The yard sample appeared only for Super Admin and Mandi Manager.
- A forbidden module for each restricted role opened “Outside this role”. Super Admin could open Finance. Mandi Manager could open Settings.
- A task dialog opened and stated that it does not start a procedure.
- Refresh kept the Accounts Officer session. Profile showed `demo.accounts`. Ending the session returned to login, and `/` then redirected to login.
- Forgot password listed the published password and every desk, with no mail form.
- The mobile navigation for Accounts Officer listed Dashboard, Trading, Finance, Reports, and Settings, and opened Finance.

## Phase 3 — Master data and stakeholder registration

Status: accepted. Phase 4 was requested after this register.

Registers live in this browser under `naga-mandi-os.registry`. Desk codes such as DG-14 and DEMO-REG-FS-7001 are demonstration labels. They are not people, filings, or office deletions. The desk uses one working mandi in the interface. Every row still stores `mandiId`.

### Screens

- Stakeholder hub at `/stakeholders`, with counts for the working list and a control that restores the sample register.
- Listing, create, detail, and edit screens for farmers and sellers, buyers, aadathiyas and traders, transporters, warehouse operators, facility operators, commodities, commodity grades, measurement units, mandi locations, and fee categories.
- Stakeholder detail tabs: Overview, Documents, Transactions, Licences, Activity History. The Transactions tab shows sample links. The Licences tab lists SOP-001 cases for that desk, from Phase 4, plus the older sample bands.
- Catalog detail pages show overview fields and activity history.

### Routes

Each register uses `/stakeholders/{path}`, `/new`, `/{id}`, and `/{id}/edit`.

| Path | Register |
| --- | --- |
| `farmers` | Farmers and sellers |
| `buyers` | Buyers |
| `aadathiyas` | Aadathiyas and traders |
| `transporters` | Transporters |
| `warehouse-operators` | Warehouse operators |
| `facility-operators` | Facility operators |
| `commodities` | Commodities |
| `grades` | Commodity grades |
| `units` | Measurement units |
| `locations` | Mandi locations |
| `fees` | Fee categories |

Super Admin, Mandi Manager, Licence Officer, and Aadathiya can open these routes. Other roles are sent to `/unauthorized`.

### Functionality

- Search, status, mandi scope, and commodity filters. Sort applies to the full filtered set, then the table pages four rows at a time.
- Create and edit forms validate desk labels, fictional phone numbers, vehicles, and site codes. A new party receives `DEMO-REG-{prefix}-{seq}`. Catalog rows receive `DEMO-COM`, `DEMO-GRD`, `DEMO-UNT`, `DEMO-LOC`, or `DEMO-FEE` ids.
- Image attachments preview in the form and on the Documents tab. Other files keep a name and size. Files stay in this browser, up to 4 files and 200 KB each.
- Remove marks a row Removed. It leaves the working list and can be restored. The only working mandi cannot be removed or deactivated until another location is chosen.
- CSV export covers the current filtered rows. Import checks the same rules as the forms, reports invalid rows, and adds valid rows as new DEMO ids. It does not update existing rows.
- Activity history is written when a row is loaded, added, edited, removed, restored, or set as the working mandi.
- Global search includes parties and commodities for roles that can open Stakeholders.
- Clearing desk preferences does not wipe the register. Restore sample on the hub resets it.

### Tests

- `npm run build` (`tsc -b && vite build`) completed with exit code 0.
- Signed in as Super Admin. The hub showed Dimapur Central as the working mandi and the sample counts.
- A seller form rejected phone `12345`, then saved ZZ-77 as `DEMO-REG-FS-7001` on `mandi-dimapur` with an image preview. Overview, Documents, Transactions, Licences, and Activity History all opened. An edit to the area code stayed on the detail page.
- The seller list searched, sorted, and paged 6 then 7 rows. CSV import rejected a bad phone and added CSV-88 as `DEMO-REG-FS-7003`. Remove hid that row from the working list; the Removed filter showed it; Restore returned it to Active.
- Commodity Tree tomato saved as `DEMO-COM-7006` with activity history.
- Setting Kohima Ridge as the working mandi hid Dimapur sellers from the working scope. All mandis on file still listed them. Dimapur Central was set back as the working mandi.
- Seed seller DG-14 showed sample transaction `DEMO-TXN-2414` and sample licence `DEMO-LIC-014`.
- Refresh kept ZZ-77 in `naga-mandi-os.registry`. Farmer / Seller opening `/stakeholders` landed on “Outside this role”. The session was returned to Super Admin.

### Remaining

Continued in Phase 4 for SOP-001. Arrival, trading, finance, warehouse, cold-storage, post-harvest, parking, facility, compliance, and report workflows stay on the operating map.

## Phase 4 — Licence management (SOP-001)

Status: accepted. Gate arrivals are recorded in Phase 5.

Licence cases live in this browser under `naga-mandi-os.licences`, separate from the stakeholder register. Application ids, licence numbers, receipts, and QR codes are demonstration labels. They are not permits, filings, or collections. The demonstration date is 14 Nov 2026. New applications are stamped with the working mandi id.

### Screens

- Licence dashboard at `/licences`, with pipeline counts, role copy, and a control that restores the licence sample without touching the stakeholder register.
- New application at `/licences/apply`.
- Document verification at `/licences/verify`.
- Approval queue at `/licences/approvals`.
- Fee and security deposit at `/licences/fees`.
- Licence issuance at `/licences/issue`.
- Licence register at `/licences/register`.
- Expiry alerts at `/licences/alerts`.
- Renewal at `/licences/renew/:id` and modification at `/licences/modify/:id`.
- Case detail at `/licences/:id`, with applicant, business, category, documents, checklist, and activity.
- Printable preview at `/licences/:id/print`.

### Workflow

Application Submitted → Under Verification → Pending Manager Approval → Approved → Fee/Deposit Recorded → Licence Issued.

Clarification required returns to the desk that asked: the Licence Officer desk, or the Mandi Manager desk. Rejected is terminal. A renewal or modification can start from an issued licence that has no open follow-up. Issuing the follow-up marks the parent replaced in this browser.

### Desks

| Desk | What it can do |
| --- | --- |
| Applicant (Farmer / Seller, Buyer, Aadathiya) | File an application for that desk’s parties, see only its own cases, and reply when clarification is required |
| Licence Officer | Start verification, complete the checklist, ask for clarification, reject, and issue after a sample receipt |
| Mandi Manager | Approve, ask for clarification, or reject while a case is pending approval |
| Accounts Officer | Record a sample receipt after approval. The screen states that no money moves |
| Super Admin | Oversight of every step in this browser. The copy says this does not grant office authority |
| Inspector / Auditor | Read the queues, register, and alerts |

A role that opens another desk’s step sees “Another desk handles this step”. A role without the licences module still lands on `/unauthorized`.

### Functionality

- The form captures a fictional desk label, area, phone, `…@demo.mandi` email, business code, `DEMO-BR-` registration, `DEMO-TAX-` tax id, category, and a declaration. Category follows the party: vendor, trader, or buyer.
- Supporting files use the same 200 KB demonstration reader as the register. Identity, registration, and tax are required.
- The checklist covers identity, business registration, tax identification, additional documents, a complete form, attached documents, and remarks. Forwarding requires the required lines marked Pass.
- Sample fee labels: vendor ₹2,400 / ₹10,000, trader ₹6,000 / ₹25,000, buyer ₹4,000 / ₹15,000. Methods are “Simulated desk note” and “Simulated transfer”. Receipt ids are `DEMO-RCT-…`.
- Issued licences receive `DEMO-LIC-FS`, `DEMO-LIC-AD`, or `DEMO-LIC-BY`, a one-year window from 14 Nov 2026 for a new issue, and a QR payload `DEMO|NAGA-MANDI|{number}|not-a-permit`.
- The print layout uses a white sheet, the licence number, desk code, mandi id, validity with the year, sample fee labels, the QR image, and three simulation terms. Shell chrome is omitted from print.
- Alerts list issued licences expiring on or before 14 Dec 2026, and licences already past 14 Nov 2026. Replaced rows stay on the register and drop off the alerts.
- Global search includes licence cases for roles that can open Licences. Clearing desk preferences keeps licence cases. Restore licence sample resets only that store.

### Tests

- `npm run build` (`tsc -b && vite build`) completed with exit code 0.
- Signed in as Farmer / Seller on Dimapur Central. Filed CSV-88 as `DEMO-APP-8001` with three sample files and the declaration. Status was Application Submitted. The farmer desk had no verification action.
- Licence Officer moved it to Under Verification, marked the required checklist lines Pass, and forwarded it. Mandi Manager approved it. Accounts Officer recorded `DEMO-RCT-8005` with the note that no money was collected. Licence Officer issued `DEMO-LIC-FS-8006`, valid 14 Nov 2026 to 14 Nov 2027, with QR payload `DEMO|NAGA-MANDI|DEMO-LIC-FS-8006|not-a-permit`.
- The print preview showed that number, desk code CSV-88, mandi id `mandi-dimapur`, the sample fee labels, the QR image, and the simulation terms.
- Licence Officer asked for clarification on `DEMO-APP-4102`. The same desk rejected `DEMO-APP-4101` after moving it under verification. Buyer replied on `DEMO-APP-4103`, and that case returned to Under Verification.
- Expiry alerts listed `DEMO-APP-4107` (30 Nov 2026) and `DEMO-APP-4110` (01 Oct 2026).
- Farmer / Seller opening `/licences/verify` saw “Another desk handles this step”. That desk’s application list showed only `DEMO-APP-8001`, `DEMO-APP-4101`, `DEMO-APP-4107`, and `DEMO-APP-4109`.
- Farmer / Seller submitted renewal `DEMO-APP-8010` from the issued CSV-88 licence. The parent stayed current. The modification form opened for `DEMO-APP-4107` and was left unsubmitted so the expiry row stayed in place.
- Buyer opening `/licences/fees` saw the Accounts Officer step. Buyer opening `DEMO-APP-8001` saw “Outside this applicant desk”.
- Refresh kept the issued licence and the renewal in `naga-mandi-os.licences`. The session was returned to Super Admin.

### Remaining

Trading, finance, warehouse, cold-storage, post-harvest, parking, facility, compliance, and report workflows stay on the operating map. No backend, payment gateway, auction, or settlement is implemented.

## Phase 5 — Agricultural produce arrival and lot management

Status: accepted. Sales and buying are recorded in Phase 6.

Gate lots live in this browser under `naga-mandi-os.arrivals`, separate from the Phase 1 yard-sample chart and from licence cases. Arrival numbers, lot numbers, weighment, crate codes, and QR codes are demonstration labels. A slip is not a gate pass. A sold mark does not collect a payment. The sample day is 14 Nov 2026. New lots are stamped with the working mandi id `mandi-dimapur`.

### Screens

- Daily arrivals at `/arrivals`, with sample-day counts, the seven statuses, and links into the form, register, and crate list.
- New goods arrival at `/arrivals/new`.
- Arrival register at `/arrivals/register`.
- Crate inventory at `/arrivals/crates`.
- Lot detail at `/arrivals/:id`, with weighment, photos, QR identification, and movement history.
- Printable arrival slip at `/arrivals/:id/print`.

### Lot status

Arrived → Under Inspection → Available → Reserved or Sold → Dispatched.

Cancelled is available from Arrived, Under Inspection, Available, and Reserved, and it needs a note of at least 8 characters. Dispatched and Cancelled are closed. The detail page only offers a legal next status, and the store rejects any other change.

### Functionality

- The form selects an active seller and aadathiya on Dimapur Central, a commodity that has an active grade, a unit, a weigh bay (`WB-01` or `WB-02`), a demonstration vehicle (`NL07-DEMO-214` shape), and crates (`CR-14` shape when the count is above zero).
- Quantity must be greater than zero, at most three decimal places, and equal to gross minus tare. Gross must exceed tare. Tare cannot be negative. Crate count is a whole number from 0 to 500.
- Up to three photos use the same 200 KB demonstration reader as the register, and the lot page shows the file preview.
- A new lot receives `DEMO-ARR-…` and `DEMO-LOT-…`, status Arrived, and QR payload `DEMO|NAGA-MANDI|{lot}|not-a-gate-pass`.
- The seed lots are `DEMO-LOT-5101` through `DEMO-LOT-5107`: Naga king chilli, kiwi, and ginger, with desk codes DG-14, KR-08, WK-19, AD-02, AD-09, and AD-15. The next new number starts at 5201.
- Roles with the arrivals module (Super Admin, Mandi Manager, Aadathiya, Farmer / Seller, Buyer, Warehouse Operator) see the same gate register and a Gate lots board on `/desk`. That board is labeled as separate from the yard sample. Search and the seller or aadathiya Transactions tab list matching lots. Clearing desk preferences keeps arrival lots. Restore arrival sample resets only that store.
- A role without the arrivals module, including Licence Officer, is sent to `/unauthorized`.

### Tests

- `npx tsc -b` completed with exit code 0.
- Signed in as Super Admin. The daily desk showed one lot in each of the seven statuses, 5 uncancelled lots on 14 Nov 2026, 69.6 q kept, and 54 crates.
- Registered `DEMO-ARR-5201` / `DEMO-LOT-5201` for desk code CSV-88 (the first active seller in this browser), aadathiya AD-02, Naga king chilli grade A, 9 q, gross 10 q, tare 1 q, bay WB-01, 4 crates CR-14, vehicle NL07-DEMO-901, and a photo preview. Status was Arrived. Mandi id was `mandi-dimapur`. QR payload was `DEMO|NAGA-MANDI|DEMO-LOT-5201|not-a-gate-pass`.
- The rules rejected a negative quantity, a negative tare, a gross that does not exceed tare, a quantity that does not equal the net, and a negative crate count. Arrived could not move to Sold. A two-character cancellation note was rejected and the lot stayed Under Inspection.
- Under Inspection was accepted from Arrived. The history listed the inspection bay, then the gate.
- The print slip showed the lot number, desk codes, weighment, crates, mandi id, the QR image, and the simulation wording. The print dialog was not opened.
- Crate inventory listed `DEMO-LOT-5201` and left out the dispatched and cancelled seed lots.
- Refresh kept the lot, photo, and Under Inspection status in `naga-mandi-os.arrivals`.
- `/desk` showed Gate lots at 7 sample-day rows, 2 under inspection, 78.6 q, and 58 crates, beside the unchanged yard sample of 1,119.6 MT and 11 fictional lots.
- Search found `DEMO-LOT-5201`. The CSV-88 seller Transactions tab listed it. Farmer / Seller saw the same Gate lots board. Licence Officer opening `/arrivals` landed on `/unauthorized`. The session was returned to Super Admin.

### Remaining

Finance collection, warehouse, cold storage, post-harvest, parking, facilities, compliance, and reports stay on the operating map. No backend or settlement is implemented.

## Phase 6 — Mandi sales and buying (SOP-002 and SOP-003)

Status: accepted. The simulated finance book follows in Phase 7.

Trades live in this browser under `naga-mandi-os.trades`, separate from the yard-sample trade chart and from gate lots. A trade points at a gate lot. Seller parchis, buyer parchis, commission, hamali and transport use a fictional schedule. Nothing on this desk collects money or opens a bid.

### Screens

- Trading dashboard at `/trading`.
- Seller arrivals at `/trading/arrivals`.
- Buyer requirements at `/trading/requirements`.
- Available produce lots at `/trading/lots`.
- Aadathiya workspace at `/trading/workspace`.
- Price discovery at `/trading/discover` and `/trading/discover/:lotId`.
- Negotiation records at `/trading/negotiations`.
- Trade confirmation at `/trading/:id`.
- Seller parchi at `/trading/:id/seller-parchi` and buyer parchi at `/trading/:id/buyer-parchi`.
- Commission preview at `/trading/commission`.
- Hamali and transport rates at `/trading/charges`.
- Trade register at `/trading/register`.
- Pending payments at `/trading/payments`.

### Price discovery

Negotiated sale, auction record, and hatha negotiation record are written notes. The auction record does not open bidding. The hatha record does not open a hand-signal session.

### Trade link and schedule

Each trade stores the seller, buyer, aadathiya, commodity, lot, quantity, price, charges, commission and payment status. The default fictional schedule is seller commission 2 percent, buyer commission 1 percent, and hamali ₹15 per unit. Transport is entered on the trade. Seller net is the sale value minus seller commission. Buyer due is the sale value plus buyer commission, hamali and transport. Hamali and transport are collected on the buyer parchi and are not deducted again from the seller. Confirmed trades keep the rates copied at confirmation.

### Status

Negotiating → Confirmed → Documented. Cancelled is available before the parchis are prepared. A documented trade cannot return to negotiating, and it cannot be cancelled. Payment notes start only after the parchis exist: Pending → Credit note, Debit note, or Noted in the book. A credit note or debit note can move only to Noted. Noted cannot return to Pending. Confirming quantity reserves the lot. Documenting the whole lot marks it sold. A partial document leaves the lot reserved.

### Tests

- `npx tsc -b` completed with exit code 0.
- The sample book showed `DEMO-TRD-6101` documented (negotiated chilli, buyer due ₹36,724.20), `DEMO-TRD-6102` confirmed (hatha ginger), and `DEMO-TRD-6103` negotiating (auction record). One buyer requirement stayed open.
- A quantity of 100 q on `DEMO-LOT-5103` was rejected because 9.75 q was still open. A negative quantity, a zero quantity, a zero price and a negative transport were rejected by the same rules. Negotiating could not jump to Documented, and a payment note was refused before the parchis.
- Saved `DEMO-TRD-6201` for DG-14, BY-03 and AD-02: 2 q of Naga king chilli grade B at ₹8,000, transport ₹200. Sale value ₹16,000. Seller commission ₹320. Seller net ₹15,680. Buyer commission ₹160. Hamali ₹30. Buyer due ₹16,390. Confirming reserved the lot. Preparing the parchis issued `DEMO-PRC-S-6201` and `DEMO-PRC-B-6201`.
- The seller and buyer print layouts showed the desk codes, lot, quantity, price, fictional-rate lines, signatures and a QR mark ending in `not-a-receipt`. The print dialog was not opened.
- A credit note was recorded. The book refused a return to Pending. Changing the schedule to 3 percent left the stored seller commission at ₹320, and the schedule was put back to 2 percent.
- Refresh kept the trade. `/desk` showed Floor trades beside the unchanged yard-sample chart. Licence Officer opening `/trading` landed on `/unauthorized`. The session was returned to Super Admin.

### Remaining

Finance collection, warehouse, cold storage, post-harvest, parking, facilities, compliance and reports stay on the operating map. No backend, live auction or settlement is implemented.

## Phase 7 — Frontend finance and settlement simulation

Status: accepted. The warehouse book follows in Phase 8.

The finance book lives in this browser under `naga-mandi-os.finance`. Amounts are stored as integer paise. Licence fees, security, commission, notes and receipts are calculated on the desk. Nothing is sent to a gateway, a bank, or a posted ledger. The yard-sample chart stays separate.

### Screens

- Finance dashboard at `/finance`, with its own restore for the finance sample.
- Licence fee register at `/finance/fees`.
- Security deposit register at `/finance/deposits`.
- Aadathiya commission ledger at `/finance/commission`.
- Buyer collections at `/finance/collections`.
- Seller payments at `/finance/seller-payments`.
- Credit notes at `/finance/credit-notes`.
- Debit notes at `/finance/debit-notes`.
- Payment receipts at `/finance/receipts`, and a printable receipt at `/finance/receipts/:id/print`.
- Outstanding receivables at `/finance/receivables`.
- Daily reconciliation at `/finance/reconciliation`.
- Daily closing at `/finance/closing`.
- Financial reports at `/finance/reports`, with a CSV export.

Clearing saved demo data does not remove the finance book. Every money screen says DEMO / SIMULATED.

### Security and notes

Opening simulated security is ₹10,000 for AD-02 and ₹20,000 for AD-09. Trader licence deposits are added only when the licence is fee-recorded or issued. A credit note may be issued above the available security. Redemption is refused when the amount would pass that balance, when the note is not approved, or when it was already redeemed. The balance does not go negative. A debit note moves draft, approved, collected. A collected note cannot be collected again. Direct seller and buyer receipts settle outstanding without using security. Cancelled notes release the outstanding they reserved.

Reconciliation moves open, checked, closed. The checked totals stay as a snapshot. Closing moves open, submitted, approved, closed, and submit is refused while reconciliation is still open. A closed day blocks new simulated postings. Restore finance sample replaces only this book.

### Tests

- `npx tsc -b` completed with exit code 0.
- The desk showed licence fees ₹20,800.00, AD-02 security ₹10,000.00, commission ₹1,563.60 from the two documented trades, and buyer outstanding ₹52,114.20. Confirmed and negotiating trades were not in the book. The yard sample stayed at ₹17.88 cr, 1,119.6 MT and 11 lots.
- `DEMO-CRN-7101` for ₹2,000.00 redeemed once. A second redemption was refused. AD-02 security became ₹8,000.00.
- A credit note for the full ₹15,680.00 seller net on `DEMO-TRD-6201` was approved and then refused at redemption because it passed the security balance. It was cancelled. A ₹4,000.00 note was approved and redeemed. Security became ₹4,000.00. A blank amount was refused. Negative and extra-decimal rupee text is rejected by the paise parser.
- `DEMO-DBN-7101` for ₹1,000.00 moved from draft to approved to collected. A second collection was refused.
- Reconciliation could not return from checked to open. Closing could not be submitted while reconciliation was open. After the check, a later note did not rewrite the snapshot. Reconciliation was closed, then closing moved submitted, approved, closed. A new credit note and a commission approval were refused because the sample day is closed.
- Receipt `DEMO-FIN-7201` showed DEMO / SIMULATED, ₹2,000.00, the credit-note redemption line, a QR image, and the wording that it is not a bank receipt. The print dialog was not opened.
- The CSV export began with the paise-formatted totals and DEMO / SIMULATED on each row.
- Refresh kept the notes and receipts in `naga-mandi-os.finance`. `/desk` showed the simulated finance board beside the unchanged yard sample. Licence Officer opening `/finance` landed on `/unauthorized`. The session was returned to Super Admin.

### Remaining

Warehouse, cold storage, post-harvest, parking, facilities, compliance and the separate reports module stay on the operating map. No backend and no real settlement is implemented.

## Phase 8 — Warehouse contract and operations management

Status: accepted. The cold storage book follows in Phase 9.

The warehouse book lives in this browser under `naga-mandi-os.warehouses`. It covers SOP-004 contract award and SOP-005 shed operations for the Dimapur sample. Deposits, stock, checklists and the contract preview stay in this book. They are not posted into the finance ledger, and they do not change a gate-lot status. The yard-sample occupancy chart stays separate.

### Screens

- Warehouse dashboard at `/warehouses`. Super Admin and Mandi Manager see the Mandi official warehouse desk. The warehouse operator sees the Warehouse operator desk. An inspector sees the inspection desk without post buttons.
- Warehouse directory at `/warehouses/directory`.
- Contract application at `/warehouses/apply`.
- Application verification and approval at `/warehouses/contracts` and `/warehouses/contracts/:id`.
- Deposit record on an approved contract.
- Contract document preview at `/warehouses/contracts/:id/print` for an issued contract.
- Stock inward at `/warehouses/inward` and stock outward at `/warehouses/outward`.
- Inventory register at `/warehouses/inventory`, including movement history.
- Occupancy dashboard at `/warehouses/occupancy`.
- Cleaning checklist, fire safety checklist and security inspection at `/warehouses/cleaning`, `/warehouses/fire` and `/warehouses/security`.
- Insurance record at `/warehouses/insurance`.
- Maintenance log at `/warehouses/maintenance`.
- Contract expiry alerts at `/warehouses/alerts`.

Clearing saved demo data does not remove the warehouse book. Restore warehouse sample replaces only this book. Every warehouse screen says DEMO / SIMULATED.

### Contracts, stock and checks

A contract moves draft, submitted, under verification, clarification required, verified, approved, deposit recorded, issued. Rejected and issued stop the path. A draft cannot jump to issued. Issue needs a deposit receipt and no other issued contract on that shed. Allocation is the issued contract. A shed with any contract that is not rejected cannot take a second application.

Stock is stored as hundredths of a quintal. Inward quantity must be above zero, inside the free shed capacity, and inside the produce still outside the sheds for that lot. A cancelled lot cannot enter. Outward quantity must be above zero and cannot pass the stock still in that shed. Movements do not change the arrival status. History is the movement list, newest first.

A checklist line is yes or no. A no needs a note of at least eight characters. An issued contract and an insurance record alert when the end date is within 30 days of 14 Nov 2026, or already past. The sample contract `DEMO-WHC-8101` ends 2026-12-01. The sample cover `DEMO-INS-8101` ends 2026-12-10.

### Tests

- `npx tsc -b` completed with exit code 0.
- As Super Admin, `/warehouses` showed the Mandi official warehouse desk, three sheds, and the DEMO / SIMULATED notice. `DEMO-WHC-8102` moved from under verification to verified, approved, deposit recorded at ₹15,000.00 (`DEMO-WH-RCT-8102`), then issued. The preview showed DEMO / SIMULATED, the wording that it is not a lease deed, ₹15,000.00, and a QR image. The print dialog was not opened.
- Inward of 100 q on `DEMO-LOT-5201` was refused because it passed the produce still outside the sheds. Outward of 50 q was refused because it passed the stock in the shed. One quintal inward and one quintal outward were saved as `DEMO-WHM-8201` and `DEMO-WHM-8202`. The inventory register lists both, plus the seed inward of 4.00 q of `DEMO-LOT-5101` in WH-D1. `DEMO-LOT-5201` stayed under inspection. A negative quantity and a blank quantity are rejected by the unit parser.
- A blank fire checklist was refused. Marking every line yes filed `DEMO-WHK-8201`. Alerts listed `DEMO-WHC-8101` (17 days) and `DEMO-INS-8101` (26 days). Maintenance `DEMO-MNT-8101` closed, and the close button left the page.
- `/desk` showed the warehouse book at 3 sheds and 4.00 q beside the unchanged yard sample: ₹17.88 cr, 1,119.6 MT, 11 lots, and the 65 percent yard occupancy figure. Finance stayed on its closed sample day. Search for `DEMO-WHC` returned both contracts. WH-K2 lists issued `DEMO-WHC-8102` as a simulated contract, not a deed.
- Cold Storage Operator opening `/warehouses` landed on `/unauthorized`. The warehouse operator desk title is Warehouse operator desk. The session was returned to Super Admin.

### Remaining

Cold storage, post-harvest, parking, facilities, compliance and the separate reports module stay on the operating map. No backend, deed, insurer or live godown is implemented.

## Phase 9 — Cold storage contract and operations management

Status: accepted. The FLP book follows in Phase 10.

The cold storage book lives in this browser under `naga-mandi-os.cold-storage`. It covers SOP-006 contract award and SOP-007 chamber operations for the Dimapur sample. Deposits, stock, checklists, incidents and temperature readings stay in this book. They are not posted into the finance ledger, they do not change a gate-lot status, and they do not change the warehouse book. Readings come from a sample script or a manual entry. No probe or IoT device is connected. The yard-sample cold-room count stays separate.

### Screens

- Cold storage dashboard at `/cold-storage`. Super Admin and Mandi Manager see the Mandi official cold storage desk. The cold storage operator sees the Cold storage operator desk. An inspector sees the inspection desk without post buttons.
- Facility directory at `/cold-storage/directory`.
- Contract application at `/cold-storage/apply`.
- Approval, deposit and issue at `/cold-storage/contracts` and `/cold-storage/contracts/:id`.
- Contract preview at `/cold-storage/contracts/:id/print` for an issued contract.
- Storage allocation at `/cold-storage/allocation`, including movement history.
- Stock inward at `/cold-storage/inward` and stock outward at `/cold-storage/outward`.
- Temperature monitoring at `/cold-storage/temperature`.
- Manual temperature entry at `/cold-storage/temperature/entry`.
- Temperature history chart at `/cold-storage/temperature/history`.
- Gas safety, fire safety, hygiene and security at `/cold-storage/gas`, `/cold-storage/fire`, `/cold-storage/hygiene` and `/cold-storage/security`.
- Insurance register at `/cold-storage/insurance` and maintenance register at `/cold-storage/maintenance`.
- Incident reporting at `/cold-storage/incidents`.
- Compliance alerts at `/cold-storage/alerts`.

Clearing saved demo data does not remove the cold storage book. Restore cold storage sample replaces only this book. Every cold storage screen says DEMO / SIMULATED.

### Contracts, stock and temperature

A contract moves draft, submitted, under verification, clarification required, verified, approved, deposit recorded, issued. Rejected and issued stop the path. A draft cannot jump to issued. Issue needs a deposit receipt and no other issued contract on that chamber. Allocation is the issued contract.

Stock is stored as hundredths of a quintal and linked to a gate lot. Inward quantity must be above zero, inside the free chamber capacity, and inside the produce still outside the chambers for that lot. A cancelled lot cannot enter. Outward quantity cannot pass the stock still in that chamber. Movements do not change the arrival status or the warehouse book.

Each chamber has a demo band. CS-D1 is 2.0°C to 6.0°C. A reading outside the band is saved and shown as a warning. A blank temperature, an extra decimal, and a negative stock quantity are rejected. A temperature may be below zero. Compliance alerts also cover issued contracts and simulated cover ending within 30 days of 14 Nov 2026, and open incident notes.

### Tests

- `npx tsc -b` completed with exit code 0.
- As Super Admin, `/cold-storage` showed the Mandi official cold storage desk, three chambers, 2.50 q, one contract waiting, and a chamber outside the demo band. `DEMO-CSC-9102` moved from under verification to verified, approved, deposit recorded at ₹15,000.00 (`DEMO-CS-RCT-9201`), then issued. The preview showed DEMO / SIMULATED, the wording that it is not a lease deed, ₹15,000.00, and a QR image. The print dialog was not opened.
- Inward of 100 q on `DEMO-LOT-5201` was refused because it passed the produce still outside the chambers. Outward of 50 q was refused because it passed the stock in the chamber. One quintal inward and one quintal outward were saved as `DEMO-CSM-9201` and `DEMO-CSM-9202`. `DEMO-LOT-5201` stayed under inspection. The warehouse movements were unchanged. On-hand stock remained 2.50 q of `DEMO-LOT-5101` in CS-D1.
- A blank temperature was rejected. A manual 9.0°C on CS-D1 was saved as `DEMO-CSR-9201` with a warning that it is outside 2.0°C to 6.0°C. The history chart rendered, and listed that warning beside the sample-script reading of 7.2°C. A blank gas checklist was refused. Marking every line yes filed `DEMO-CSK-9201`.
- Alerts listed the CS-D1 band warning, `DEMO-CSC-9101` ending 2026-12-01, `DEMO-CSI-9101` ending 2026-12-08, and open incident `DEMO-CSX-9101`. An incident without a title was refused. The sample incident was closed.
- `/desk` showed the cold storage book at 3 chambers, 2.50 q and 1 threshold warning beside the unchanged yard sample: ₹17.88 cr, 1,119.6 MT, 11 lots, 65 percent occupancy, and 14/18 cold rooms. Search for `DEMO-CSC` returned both contracts. Warehouse Operator opening `/cold-storage` landed on `/unauthorized`. The cold storage operator desk title is Cold storage operator desk. The session was returned to Super Admin.

### Remaining

Post-harvest, parking, facilities, compliance and the separate reports module stay on the operating map. No backend, deed, insurer, probe or live chamber is implemented.

## Phase 10 — Post-harvest / FLP unit management

Status: accepted. The parking book follows in Phase 11.

The FLP book lives in this browser under `naga-mandi-os.flp`. It covers SOP-008 cleanliness, fire and workplace safety, insurance, goods movement, and daily reports for the Dimapur sample, plus a simulated processing line. Intake, grades, packs, output, checklists and incidents stay in this book. They do not change a gate-lot status, the warehouse book, the cold storage book, or the finance ledger. No process is certified. The yard-sample arrival chart stays separate.

### Screens

- FLP operations dashboard at `/post-harvest`. Super Admin and Mandi Manager see the Mandi official FLP desk. The FLP operator sees the FLP operator desk. An inspector sees the inspection desk without post buttons.
- Unit directory at `/post-harvest/directory`.
- Produce intake at `/post-harvest/intake`.
- Processing batch register at `/post-harvest/batches` and the trail at `/post-harvest/batches/:id`.
- Sorting and grading at `/post-harvest/sorting`.
- Packaging records at `/post-harvest/packaging`.
- Batch output at `/post-harvest/output`.
- Material movement at `/post-harvest/movement`.
- Cleaning and hygiene at `/post-harvest/cleaning`.
- Equipment maintenance at `/post-harvest/maintenance`.
- Fire and workplace safety at `/post-harvest/safety`.
- Insurance record at `/post-harvest/insurance`.
- Incident register at `/post-harvest/incidents`.
- Daily operational reports at `/post-harvest/reports`.

Clearing saved demo data does not remove the FLP book. Restore FLP sample replaces only this book. Every FLP screen says DEMO / SIMULATED.

### Traceability and reconciliation

A batch holds the gate lot, seller desk code, commodity and intake. Grade lines, pack lines, the output record and material movements point back at that batch. The batch page lists the input lot, grades, packs, output and linked movements.

Quantities are stored as hundredths of a quintal. Intake must be above zero and cannot pass the produce still outside this FLP book for that lot. A cancelled lot cannot enter. Grade and waste cannot pass the intake still ungraded. Packs need a grade line and cannot pass the graded produce still unpacked. One output is allowed per batch. It needs packs and cannot pass the packed quantity. A smaller output is saved, and the gap stays visible.

The gap is ungraded produce, graded produce not packed, and packed produce not issued. Waste is counted on the graded side and is not packed. A batch is reconciled only when all three gaps are zero and an output exists. A shortfall is shown. It does not block a later step that stays inside the previous quantity, and it does not block the daily report. A manual crate, film or carton movement does not change the reconciliation. Intake writes an inward movement. Output writes an outward movement.

A checklist line is yes or no. A no needs a note of at least eight characters. The daily report uses the demonstration day 14 Nov 2026. A second report for that day is refused. Super Admin and Mandi Manager can note a filed report. Filing copies the intake, output and discrepancy totals. Nothing is audited.

### Tests

- `npx tsc -b` completed with exit code 0.
- As Super Admin, `/post-harvest` showed the Mandi official FLP desk, three units, intake of 6.00 q, one discrepancy, and a link to every screen. Seed batch `DEMO-FLB-10102` showed intake 2.00 q, graded 1.50 q, and the discrepancy of 0.50 q not graded and 1.50 q graded and not packed. Seed batch `DEMO-FLB-10101` showed no discrepancy.
- Intake of 100 q on `DEMO-LOT-5201` was refused because it passed the produce still outside this FLP book. One quintal was saved as `DEMO-FLB-10201`. The lot stayed under inspection. Warehouse movements stayed `DEMO-WHM-8202`, `DEMO-WHM-8201` and `DEMO-WHM-8101`. The cold storage book still held `DEMO-LOT-5101` and `DEMO-CSR-9201`.
- A grade of 2 q was refused because it passed the intake still ungraded. Grade A of 0.60 q was saved as `DEMO-FLG-10201`. A pack of 1 q was refused because it passed the graded produce still unpacked. Two packs of 0.60 q were saved as `DEMO-FLK-10201`. Output of 1 q was refused because it passed the packed quantity. Output of 0.40 q was saved as `DEMO-FLO-10201`. The trail showed the lot, the grade, the packs, the output, inward `DEMO-FLM-10201` and outward `DEMO-FLM-10202`, with 0.40 q not graded and 0.20 q packed and not issued.
- A crate movement of 2.00 q was saved as `DEMO-FLM-10203`. The toast said batch reconciliation was not changed. A blank cleaning checklist was refused. Marking every line yes filed `DEMO-FLC-10201`. An incident without a title was refused. Sample incident `DEMO-FLX-10101` was closed, and the close button left the page.
- Daily report `DEMO-FLR-10201` filed for 2026-11-14 as 3 batches, intake 7.00 q, output 4.00 q, discrepancy 2.60 q. Super Admin noted it. A second file for the same day was refused. The note said nothing was audited.
- `/desk` showed the FLP book at 3 units, 7.00 q and 2 discrepancies beside the warehouse book at 4.00 q, the cold storage book at 2.50 q, and the unchanged yard sample: ₹17.88 cr, 1,119.6 MT, 11 lots, 65 percent occupancy, and 14/18 cold rooms. Search for `DEMO-FLB` returned all three batches. Seller DG-14 lists `DEMO-FLB-10101` as a simulated batch, not a process certificate. A negative quantity is rejected by the unit parser.
- Cold Storage Operator opening `/post-harvest` landed on `/unauthorized`. The FLP operator desk title is FLP operator desk. The session was returned to Super Admin.

### Remaining

Parking, facilities, compliance and the separate reports module stay on the operating map. No backend, process certificate, insurer or live packing line is implemented.

## Phase 11 — Goods vehicle parking and transport office management

Status: accepted. The facilities book follows in Phase 12.

The parking book lives in this browser under `naga-mandi-os.parking`. It covers SOP-009 parking contracts, SOP-010 vehicle entry and the yard, and SOP-011 transport-office leases for the Dimapur sample. Visits, passes, deposits and rent stay in this book. They are not posted into the finance ledger. No fee is collected and no deed is signed. The yard-sample arrival chart stays separate.

### Screens

- Transport dashboard at `/parking`. Super Admin and Mandi Manager see the Mandi official transport desk. The parking operator sees the Parking operator desk. An inspector sees the inspection desk without post buttons.
- Parking contract application at `/parking/apply` and approval at `/parking/contracts` and `/parking/contracts/:id`.
- Vehicle registration at `/parking/vehicles`.
- Vehicle entry at `/parking/entry` and the demonstration pass at `/parking/passes/:id`.
- Vehicle exit at `/parking/exit`.
- Parking allocation at `/parking/allocation`.
- Parking occupancy at `/parking/occupancy`, with a slot grid for available, occupied and reserved.
- Parking fee simulation at `/parking/fees`.
- Vehicle movement register at `/parking/movements`.
- Transport office lease application at `/parking/offices/apply`.
- Office allotment at `/parking/offices` and `/parking/offices/:id`.
- Lease document preview at `/parking/offices/:id/print`.
- Deposit and rent register at `/parking/charges`.
- Expiry alerts at `/parking/alerts`.

Clearing saved demo data does not remove the parking book. Restore parking sample replaces only this book. Every parking screen says DEMO / SIMULATED.

### Slots, visits and money

A slot is available, occupied or reserved. An occupied slot has a vehicle inside. A reserved slot is held for one vehicle and is not occupied. Reserving or entering an occupied slot is refused. A slot reserved for another vehicle is also refused. A vehicle with an active visit cannot take a second one. Entry on a reserved vehicle uses that vehicle's own slot. A yard needs an issued parking contract before a slot can be reserved or a vehicle can enter.

Entry writes a pass with a QR mark. The mark is not a gate pass. Exit needs whole hours from 1 to 48 and notes ₹20 an hour. The fee stays on the visit. A contract or lease moves through verification, approval, a simulated deposit, and issue. Issue allots the yard or office. Rent can be noted only after an office is allotted. Issued terms that end within 30 days of 14 Nov 2026 are listed as alerts. No notice is sent.

### Tests

- `npx tsc -b` completed with exit code 0.
- As Super Admin, `/parking` showed the Mandi official transport desk, 1 occupied slot, 1 reserved slot, 12 available slots, and one allotted office. The PK-D1 grid showed A1 occupied, A2 reserved, and the other bays available.
- Reserving A1 for NL02-DEMO-041 was refused because that slot is occupied by an active visit. Entry of NL02-DEMO-041 on available A3 wrote pass `DEMO-PKP-11201`. The pass showed DEMO / SIMULATED, the vehicle, slot A3, and a QR image. The print dialog was not opened. Exit with a blank hour was refused. One hour closed the visit and stored a ₹20.00 fee that was not collected. The finance book stayed at its sample receipts of ₹20,800.00.
- A duplicate plate `NL07-DEMO-214` was refused. `NL07-DEMO-501` was registered as `DEMO-PKH-11201`. Zero and negative hours are rejected by the hour parser.
- `DEMO-PKC-11102` moved from under verification to verified, approved, deposit recorded at ₹5,000.00 (`DEMO-PK-RCT-11201`), then issued. `DEMO-TOL-11102` followed the same path, with deposit `DEMO-TO-RCT-11202`, and was allotted. The lease preview showed DEMO / SIMULATED, the wording that it is not a lease deed, ₹5,000.00, and a QR image. The print dialog was not opened. A blank rent was refused. ₹500.00 was noted as `DEMO-TOR-11203`.
- Alerts listed `DEMO-PKC-11101` ending 2026-12-10 (26 days) and `DEMO-TOL-11101` ending 2026-12-04 (20 days).
- `/desk` showed the parking book at 1 occupied slot and 1 reserved slot beside the FLP book at 7.00 q, the cold storage book at 2.50 q, the warehouse book at 4.00 q, and the unchanged yard sample: ₹17.88 cr, 1,119.6 MT, 11 lots, 65 percent occupancy, and 14/18 cold rooms. Search for `DEMO-PKC` returned both contracts. Transporter TR-214 lists visits `DEMO-PKV-11101` and `DEMO-PKV-11103` as simulated visits, not gate passes.
- FLP Operator opening `/parking` landed on `/unauthorized`. The parking operator desk title is Parking operator desk. The session was returned to Super Admin.

### Remaining

Facilities, compliance and the separate reports module stay on the operating map. No backend, deed, gate pass or collected fee is implemented.

## Phase 12 — Facility leasing and operations

Status: accepted. The command centre follows in Phase 13.

The facilities book lives in this browser under `naga-mandi-os.facilities`. It covers SOP-012 and SOP-013 for Kisan Bhavan and the hotel, and SOP-014 and SOP-015 for the restaurant. The three facility types keep their own sites, units and checklists. Application, verification, deposit, issue, rent, renewal and the contract page are shared. Deposits and rent stay in this book. They are not posted into the finance ledger. No deed is signed and no guest is a person. The yard-sample arrival chart stays separate.

### Screens

- Facilities dashboard at `/facilities`. Super Admin and Mandi Manager see the Mandi official facilities desk. The facility operator sees the Facility operator desk. An inspector sees the inspection desk without post buttons.
- Kisan Bhavan lease management at `/facilities/kisan` and applications at `/facilities/apply/kisan-bhavan`.
- Hotel lease management at `/facilities/hotel` and applications at `/facilities/apply/hotel`.
- Restaurant lease management at `/facilities/restaurant` and applications at `/facilities/apply/restaurant`.
- Lease verification and approval at `/facilities/leases/:id`.
- Contract document at `/facilities/leases/:id/print`.
- Security deposit records at `/facilities/deposits`.
- Rent tracking at `/facilities/rent`.
- Room and facility register at `/facilities/register`.
- Simulated stay records at `/facilities/stays`.
- Cleaning checklists at `/facilities/cleaning` and fire safety inspections at `/facilities/fire`.
- Food hygiene inspections at `/facilities/hygiene` and restaurant operational checklists at `/facilities/operations`.
- Maintenance logs at `/facilities/maintenance`.
- Insurance records at `/facilities/insurance`.
- Renewal and expiry alerts at `/facilities/alerts`.

Clearing saved demo data does not remove the facilities book. Restore facilities sample replaces only this book. Every facilities screen says DEMO / SIMULATED.

### Templates and money

Kisan Bhavan units are halls and a stay is a booking. Hotel units are rooms and a stay is a stay. Restaurant units are service areas and a stay is a service. Cleaning and fire apply to every issued site. Food hygiene and restaurant operations apply only to an issued restaurant. A checklist line marked No needs a note of at least 8 characters.

A lease moves through verification, approval, a simulated deposit, and issue. Issue needs the deposit and no other issued lease on that site. A site with any lease that is not rejected cannot take a second application. Rent and renewal apply only to an issued lease. A renewal date must fall after the current end. Issued leases and simulated cover ending within 30 days of 14 Nov 2026 are listed as alerts. No notice is sent.

A stay uses a fictional desk code such as GS-21. The count is a whole number from 1 to 30. A unit with an open stay cannot take another. Guest codes and operators are desk codes. Inactive operator FB-04 is not offered.

### Tests

- `npx tsc -b` completed with exit code 0.
- As Super Admin, `/facilities` showed the Mandi official facilities desk, 6 sites, 3 issued leases and 1 open stay, with every screen linked. Compliance and Reports stayed marked Later. Kisan Bhavan listed KB-D1 and KB-D2 with issued `DEMO-FCL-12101`. The hotel listed issued HT-D1 and HT-D2 under verification. The restaurant listed issued RS-D1 and open RS-D2.
- A restaurant purpose of “snack” was refused. “Snack counter service for the sample day” filed `DEMO-FCL-12201` on RS-D2. The hotel application said every site of that type already has a lease. The Kisan Bhavan operator list offered FB-01, FB-02 and FB-03.
- `DEMO-FCL-12103` moved from under verification to verified, approved, deposit recorded at ₹5,000.00 (`DEMO-FC-RCT-12201`, charge `DEMO-FCN-12201`), then issued. The contract showed Hotel lease, DEMO / SIMULATED, the wording that it is not a lease deed, ₹5,000.00, and a QR image. The print dialog was not opened.
- Booking occupied room R1 was refused. A guest value of Ada was refused. The guest and night parsers reject Ada, 0 and -1, and accept GS-21 for 2 nights. GS-21 on free room R2 wrote `DEMO-FST-12201`. Closing it left the row closed and removed the close control. The register still showed R1 occupied by GS-14 and R2 open.
- A blank cleaning checklist was refused. All yes on KB-D1 filed `DEMO-FCK-12201`. Food hygiene offered only RS-D1 and filed `DEMO-FCK-12202`. The operational checklist offered only RS-D1 and filed `DEMO-FCK-12203`. Fire safety opened on the hotel and hall templates.
- An empty maintenance title was refused. `DEMO-FCM-12101` was closed and the close control left. A cover name of “ab” was refused. “Hall cover note” filed `DEMO-FCI-12201` through 2026-12-20. A blank rent was refused. ₹500.00 on `DEMO-FCL-12101` was noted as `DEMO-FCR-12202` and was not collected. Deposits listed the three sample deposits plus the new ₹5,000.00 hotel annex deposit. The finance book stayed at ₹20,800.00.
- Renewing `DEMO-FCL-12101` through 2026-12-06 was refused. Renewal through 2027-06-01 succeeded. Alerts then listed restaurant lease `DEMO-FCL-12104` ending 2026-12-09 (25 days) and cover `DEMO-FCI-12101` ending 2026-12-05 (21 days). The renewed hall lease was no longer listed.
- Search for `DEMO-FCL` returned the leases. Operator FB-01 lists `DEMO-FCL-12101` and `DEMO-FCL-12201` as simulated leases.
- Parking Operator and FLP Operator opening `/facilities` landed on `/unauthorized`. The facility operator desk title is Facility operator desk. The session was returned to Super Admin.
- `/desk` showed the facilities book at 6 sites, 1 open stay and 0 leases in verification or approval, beside the parking book at 1 occupied and 1 reserved, the FLP book at 7.00 q, the cold storage book at 2.50 q, the warehouse book at 4.00 q, and the unchanged yard sample: ₹17.88 cr, 1,119.6 MT, 11 lots, 65 percent occupancy, and 14/18 cold rooms.

### Remaining

Compliance and the separate reports module stay on the operating map. No backend, deed, booking or collected rent is implemented.

## Phase 13 — Central command centre and SOP compliance

Status: accepted. The field desk follows in Phase 14.

The command centre reads the books already stored in this browser and keeps its own notes under `naga-mandi-os.compliance`. It covers SOP-001 through SOP-015. Incidents, corrective actions, the inspection calendar and the audit trail are demo records. They are not authoritative evidence. Clearing saved demo data does not remove this book. The yard-sample charts stay separate.

### Screens

- Mandi management dashboard at `/compliance`, with date filters, search and charts. Super Admin and Mandi Manager see the Mandi management desk. An inspector sees the Compliance inspection desk and cannot file a note.
- SOP compliance tracker at `/compliance/matrix` and `/compliance/matrix/:number`.
- Licence status at `/compliance/licences`.
- Daily trading summary at `/compliance/trading`.
- Financial reconciliation status at `/compliance/finance`.
- Warehouse occupancy at `/compliance/warehouses`.
- Cold storage status at `/compliance/cold-storage`.
- Parking occupancy at `/compliance/parking`.
- Contract and lease expiry at `/compliance/expiry`.
- Pending approvals at `/compliance/approvals`.
- Incident management at `/compliance/incidents`.
- Inspection calendar at `/compliance/calendar`.
- Corrective action tracker at `/compliance/actions`.
- Demo audit trail at `/compliance/audit`.
- Exportable reports at `/reports`. Each CSV is prepared in this browser and labelled as a demo record.

### Matrix

Each of the 15 procedures shows its number, name, department, screens, pending tasks, checklist, exceptions, last review and demo status. Status is on track, attention or exception. Attention means a task is still open. Exception means a checklist line failed. The sample day is 14 Nov 2026. Expiry uses the To date and lists issued terms inside 30 days. No notice is sent.

### Tests

- `npx tsc -b` completed with exit code 0.
- As Super Admin, `/compliance` showed Mandi management, all 15 procedures, and the links for licences, trading, reconciliation, occupancy, expiry, approvals, incidents, the calendar, actions, the audit trail and reports. The matrix read 7 on track, 6 attention and 2 exception. SOP-007 showed Cold storage operations, the cold storage desk, a pending incident, a failed band check, the exception “1 chamber sample sits outside its band,” and last review 2026-11-14.
- A trading window of 1–2 Dec 2026 listed no sales. The sample window listed 3 sales, 1 documented, at ₹36,120.00. Reconciliation and the day close were closed for 2026-11-14. Licence fees noted stayed ₹20,800.00 and buyer outstanding stayed ₹52,114.20.
- Warehouses showed 4.00 q. Cold storage showed 2.50 q and 1 band exception. Parking showed 1 occupied, 1 reserved and 12 available.
- A blank incident was refused. `DEMO-INC-13201` was filed and labelled a demo record. `DEMO-INC-13101` was closed. A blank action was refused. `DEMO-CAP-13201` was filed and `DEMO-CAP-13101` was closed. `DEMO-CIN-13201` was planned for 14 Nov 2026. The audit trail listed those steps through `DEMO-AUD-13205`, each marked “Demo record. Not authoritative evidence.”
- The SOP matrix export preview opened with that same label and one row for each procedure. Search for `DEMO-INC` returned the three incidents.
- Expiry listed the warehouse, cold, parking and office terms, restaurant lease `DEMO-FCL-12104` (25 days), cover `DEMO-FCI-12101` (21 days), and the open action due 2026-11-21. Pending approvals included `DEMO-FCL-12201`.
- The parking operator opening `/compliance` landed on `/unauthorized`. The inspector could read incidents and could not file one. The session was returned to Super Admin.
- `/desk` showed the command centre beside unchanged books: finance ₹20,800.00, warehouse 4.00 q, cold storage 2.50 q, FLP 7.00 q, parking 1 occupied and 1 reserved, facilities 6 sites and 1 open stay, and the yard sample at ₹17.88 cr, 1,119.6 MT and 14/18 cold rooms.

### Remaining

No further operating module is waiting. No backend, authoritative audit or collected rent is implemented.

## Phase 14 — Mobile-first PWA and field operations

Status: accepted. The integration audit follows in Phase 15.

The desk is an installable browser app. The manifest, icons and service worker live with the frontend. Field work is stored as drafts under `naga-mandi-os.field`. Offline mode saves drafts only. Payments, licences, financial postings and approvals are not completed from a draft or while the browser is offline. A changed record is left in place and the draft is marked as a conflict. Clearing saved demo data does not remove field drafts. No native Android application is included.

### Screens

- Field home at `/field`, with the online or offline line, draft counts, QR lookup and sync.
- Arrival entry at `/field/arrival`.
- Lot inspection at `/field/inspection`.
- Parchi preview at `/field/parchi`.
- Parking entry and exit at `/field/parking`.
- Facility inspections at `/field/facilities`.
- Bottom navigation on small screens. The sidebar remains the desktop navigation.

### Tests

- `npx tsc -b` completed with exit code 0.
- The manifest named Naga Mandi OS, used standalone display, and pointed at the 192 and 512 icons. Both icon files responded 200. The service worker registered from `/sw.js`. It leaves Vite module URLs uncached.
- At 1280px the sidebar showed Field and the bottom navigation was hidden. At 390×844 the bottom navigation showed Field, Arrive, Inspect, Parchi, Park and Sites. The arrival form used one column and the save button filled that column. The photo input accepts an image and asks for the environment camera.
- Super Admin saved arrival draft `DEMO-FLD-14201` for NL07-DEMO-880. The toast said the lot was not registered. The arrival book stayed at 8 lots. A note shorter than 8 characters was refused. Inspection draft `DEMO-FLD-14202` was saved and the lot status was not changed. Parking drafts `DEMO-FLD-14203` and `DEMO-FLD-14204` were saved. The visit stayed inside and the reserved visit stayed reserved. Facility draft `DEMO-FLD-14205` was saved and the checklist was not filed.
- Typing `DEMO|NAGA-MANDI|DEMO-LOT-5201|not-a-gate-pass` found that lot. Scan QR reported that scanning is not supported in this browser, which is the expected fallback.
- After the inspection token no longer matched, sync showed “That record changed after this draft was saved. The draft was not applied.” The status line read “1 conflict”. While the desk was offline, sync of the arrival draft stayed on the device and named the payments, licences, financial postings and approvals that are not completed offline.
- Parchi preview listed `DEMO-TRD-6201` at ₹16,000.00 and `DEMO-TRD-6101` at ₹36,120.00, each with a demonstration mark and seller and buyer preview links. Print was not used.
- The parking operator opened `/field` and saw Park, not Arrive. Arrival entry said this role does not file gate lots. The licence officer opening `/field` landed on `/unauthorized`. The session was returned to Super Admin.
- `/desk` still showed finance ₹20,800.00, warehouse 4.00 q, cold storage 2.50 q, FLP 7.00 q, parking 1 occupied and 1 reserved, facilities 6 sites and 1 open stay, the command centre, and the yard sample at ₹17.88 cr, 1,119.6 MT, 65 percent occupancy and 14/18 cold rooms.

### Remaining

No further phase is waiting. No native application, backend, payment, licence, financial posting or approval is implemented.

## Phase 15 — Frontend integration, testing and local demo readiness

Status: accepted. The optimisation and regression pass follows in Phase 16.

This phase audits the browser demonstration. It does not make the desk production-ready. No backend, payment gateway, bank transfer, real licence, official approval, or native application was added. The app is configured for http://localhost:5173.

### Checks

| Requirement | Result |
| --- | --- |
| Sidebar pages | Met. All 15 Super Admin sidebar items opened a page with a heading. None opened a later-phase placeholder. |
| Form validation | Partial. Registry, licence and arrival forms use Zod. Other desks refuse blank or short values in the page or the store. |
| Demo workflows | Partial. Earlier phases exercised each book. This pass did not repeat every workflow. |
| Persistence | Met. All 14 `naga-mandi-os.*` keys were present after navigation, including 5 field drafts. |
| Cross-module records | Met for the live books on `/desk`. The yard-sample chart stays separate from those books. |
| Roles | Met for the permission map. The parking sidebar showed Dashboard, Field, Parking & Transport and Settings. `/finance` went to `/unauthorized`. |
| Search, filters, pagination | Partial. Registry tables and the new article lists page their rows. Checklist, alert and command lists still do not. |
| Printable documents | Partial. Seller parchi `DEMO-TRD-6201` rendered. The print button was not pressed. |
| Charts | Met on `/desk`: ₹17.88 cr, 1,119.6 MT, 11 lots, 65 percent, 14/18. |
| Responsive layout | Met at 1280px (sidebar) and 390×844 (bottom navigation, hamburger). |
| Imports | Met. `npm run build` exited 0 after the hook fixes. |
| Dead buttons | No dead control was found on the pages opened in this pass. |
| Console errors | None were captured while walking the sidebar. |
| Backend | None. No network API client is in the source. |
| Real finance | None. Money figures are simulated paise in this browser. |

### Commands

- `npm run lint` first exited 1 because several pages called a second store hook behind `&&`. Those calls were split so every hook runs on each render. The second `npm run lint` exited 0 with warnings and no errors.
- `npm run build` exited 0. The production JavaScript chunk is about 1.8 MB. Vite warned that it is larger than 500 kB.
- `npm run dev` is serving http://localhost:5173.

### Remaining

Checklist, alert, incident and command-centre lists do not all paginate. Oxlint still reports fast-refresh, react-hook-form and effect warnings. QR scanning needs `BarcodeDetector`, which this browser does not provide. The print dialog was not opened. This is a local demonstration, not a production system.

## Phase 16 — Final frontend optimisation, regression and UAT readiness

Status: complete, awaiting approval.

This phase stays in the browser. No backend, database, Docker, API or Krishora work was started. The signed-in demonstration books were not cleared and no fee, deposit, collection or settlement was posted. The desk is not production-ready.

### What changed

- Checklist, alert and command-centre card lists page four rows at a time, with Previous and Next.
- Route pages load through `React.lazy` and `Suspense`. Login, the introduction and the shell stay in the first script.
- Credit and debit notes have a read-only print page at `/finance/notes/:id/print`.
- The field QR panel keeps typed entry. If this browser cannot scan, it says the camera was not opened.

### Commands

- `npx tsc -b --pretty false` exited 0.
- `npm run lint` exited 0 with 22 warnings and no errors.
- `npm run build` exited 0. The entry script fell from 1,792.03 kB (gzip 478.40 kB) to 761.90 kB (gzip 214.48 kB). Vite still warns that the entry is over 500 kB.
- `npm run dev` was already serving http://localhost:5173 and was left running.
- `npm run test:e2e` exited 0: 4 Playwright tests passed in an isolated browser. They do not read or write the signed-in books.

### Browser pass

The signed-in session was Super Admin (`demo.super`) at the start and after the role walk. A reload left 15 `naga-mandi-os.*` keys, the same five field drafts, and receipts `DEMO-FIN-7201`, `DEMO-FIN-7202` and `DEMO-FIN-7203`. Finance totals were still licence fees ₹20,800.00, security available ₹74,000.00, commission ₹1,563.60 and buyer outstanding ₹52,114.20.

Command centre pagination moved from “Showing 1–4 of 15” to “Showing 5–8 of 15”. Print layouts rendered for both parchis, the issued licence, a receipt, a credit note, a debit note, warehouse and cold-storage contracts, a hotel lease, a transport-office lease, an arrival slip and a vehicle pass. Print was not clicked. Layouts at 390×844, 768×1024 and 1280×800 did not widen the document past the viewport. All 13 roles were opened; restricted roles landed on “Outside this role” for a route the sidebar does not offer, and that page did not show finance or trade identifiers.

### Remaining

Oxlint still warns about fast refresh, React Hook Form, and the party-form reset effect. The entry script is still above 500 kB. Typed QR entry is the fallback because this browser has no `BarcodeDetector`. Frontend route checks are not server-side security. Creating, editing and status changes were not repeated on the live books. This remains a local demonstration.
