# Frontend audit

Naga Mandi OS is a frontend demonstration. This audit was run in the browser at http://localhost:5173 on 16 Nov 2026. It is not a production-readiness claim.

## Commands

- `npm run lint`: the first run exited 1. Fifteen call sites used `useStore(...) && useOtherStore(...)`, which skips the later hook. Each hook is now called on its own line. The second run exited 0. Warnings remain for fast refresh, react-hook-form memoization, a ref read during render, and `setState` inside an effect.
- `npm run build`: exited 0 (`tsc -b` and Vite). The main JavaScript chunk is about 1.8 MB and Vite warned that it exceeds 500 kB.
- `npm run dev`: Vite serves the desk at http://localhost:5173 with `strictPort`.

## What was exercised

- Super Admin opened every sidebar item: Dashboard, Field, Stakeholders, Licences, Produce Arrivals, Trading, Finance, Warehouses, Cold Storage, Post-Harvest, Parking & Transport, Facilities & Leasing, Compliance, Reports, Settings. Each page showed its own heading. No page was a later-phase placeholder. No Vite error overlay appeared, and no `window` error was captured during the walk.
- `/desk` showed the live books and the separate yard sample: ₹17.88 cr, 1,119.6 MT, 11 lots, 65 percent occupancy, 14/18 cold rooms. Licence fees noted were ₹20,800.00. Buyer outstanding was ₹52,114.20. Warehouse stock was 4.00 q, cold storage 2.50 q, FLP 7.00 q, parking 1 occupied and 1 reserved, facilities 6 sites and 1 open stay.
- The yard-sample table showed “Showing 1–8 of 11 demonstration rows”, with Previous and Next.
- Seller parchi `/trading/DEMO-TRD-6201/seller-parchi` rendered `DEMO-PRC-S-6201` and the print button. The button was not pressed.
- At 1280px the sidebar was visible. At 390×844 the field desk used the bottom navigation and the “Open navigation” control.
- After navigation, localStorage still held the session, registry, licences, arrivals, trades, finance, warehouses, cold storage, FLP, parking, facilities, compliance, field drafts, UI and demo keys. Five field drafts were still stored.
- The parking operator sidebar was Dashboard, Field, Parking & Transport, Settings. Opening `/finance` landed on `/unauthorized`. The session was returned to Super Admin (`demo.super`, password `demo-mandi`).

## Requirement notes

1. Sidebar items open functioning pages.
2. Registry, licence and arrival forms validate with Zod. Other forms refuse empty or short values in the page or the store. They do not all share one schema.
3. End-to-end workflows were verified in Phases 2–14. This pass did not repeat every create, approve and issue step.
4. Books persist in this browser across refresh and navigation.
5. Desk cards read the same local books. The yard-sample chart is a separate fictional sample.
6. Role navigation comes from `navigationForRole`. The full map is in `ROLE_MATRIX.md`. One restricted role was checked in the browser.
7. Party, catalogue, licence, arrival and trade tables search, filter and paginate. Warehouse, cold, FLP, parking and finance registers gained the same controls in this phase. Checklist, alert and command-centre lists still do not paginate.
8. Print layouts exist for arrivals, licences, parchis, receipts, warehouse and cold contracts, office leases and facility leases. One parchi was opened. The print dialog was not used.
9. Desk charts showed the sample figures above.
10. Desktop and phone widths were checked.
11. The production build completed, so the TypeScript project has no broken imports.
12. Buttons opened in this pass were links or had handlers. A full click of every button was not performed.
13. No console error was captured on the sidebar walk.
14. The source has no API client.
15. Amounts are simulated paise. Nothing is collected.

## Remaining issues

- Checklist, alert, incident and command lists are not paginated.
- Oxlint warnings remain. They do not fail the lint script.
- The production bundle is a single large chunk.
- QR scanning needs `BarcodeDetector`. This browser asks for a typed demonstration code instead.
- Historical workflow steps were not all repeated in this audit.
