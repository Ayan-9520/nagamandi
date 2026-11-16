# Phase 16 audit

Naga Mandi OS remains a frontend demonstration: React, TypeScript and Vite, with records in this browser. Phase 16 did not add a backend, database, Docker service, API or Krishora integration. It did not declare the desk production-ready.

The signed-in browser was left on Super Admin (`demo.super`). Its finance book, registers and field drafts were not replaced.

## Fixes

| Item | Result |
| --- | --- |
| Pagination | Checklist, alert and command-centre card lists use a four-row page with Previous and Next. On the live command centre, Next moved the list from “Showing 1–4 of 15 demonstration rows” to “Showing 5–8 of 15”. Warehouse cleaning showed “Showing 1–1 of 1” and warehouse alerts showed “Showing 1–2 of 2”. |
| Lint | Actionable hook and ref warnings that were in the way of the build were fixed, including the mobile navigation sheet. Useful rules were not disabled. 22 warnings remain and are listed in the performance report. |
| Code splitting | Page modules load with `React.lazy` and a `Suspense` fallback. The route tree itself stays static because the router does not accept lazy route children. |
| Bundle | Entry JavaScript fell from 1,792.03 kB (gzip 478.40 kB) to 761.90 kB (gzip 214.48 kB). The entry is still over Vite’s 500 kB warning. |
| QR | “Use typed code” stays on the field desk. Scanning in this browser shows “QR scanning is not supported in this browser.” The same fallback was covered by Playwright. |
| Print | Read-only print sheets rendered for the documents listed in `PRINT_QR_TEST_REPORT.md`. `window.print()` was not called. Credit and debit notes gained `/finance/notes/:id/print`. |
| Responsive | 390×844, 768×1024 and 1280×800 were checked on the desk, field desk and trade register. Document scroll width did not exceed the viewport. The hamburger is shown below the large breakpoint and the sidebar is shown at 1280px. |

## Commands actually run

| Command | Result |
| --- | --- |
| `npx tsc -b --pretty false` | Exit 0, after the mobile sheet was pointed at the open-path state. |
| `npm run lint` | Exit 0. 22 warnings, 0 errors. |
| `npm run build` | Exit 0 in 15.80s. |
| `npm run dev` | Already running at http://localhost:5173. A second server was not started. |
| `npm run test:e2e` | Exit 0. 4 passed, 0 failed, 38.7s. Chromium only. Isolated context. |

Earlier Playwright attempts in this same phase failed on strict locators (four “Enter the desk” links, two “Licences” links, and a parchi navigation that ran before the desk heading appeared). Those locators were narrowed and the suite above was re-run. The passing run is the one that counts.

## Passing

- Typecheck, lint (warnings only), production build, and the four Playwright tests.
- Command-centre pagination in the signed-in browser.
- Print-sheet render for the documents opened in this pass.
- QR typed-entry fallback in the signed-in browser and in Playwright.
- Role sidebar and one blocked route for every role that has a blocked route in the probe list.
- Persistence after reload: 15 `naga-mandi-os.*` keys, five field drafts, three finance receipts, session `demo.super` / `super-admin`.

## Failed

No source test is still failing. The locator failures above were corrected and re-run to a green suite.

## Blocked

These were not executed because this pass must not change the signed-in finance book or replace `localStorage`:

- Posting a new licence fee, security deposit, collection, seller payment, settlement, or credit/debit approval.
- Syncing the saved parking-exit draft or filing a new gate lot over the live arrival book.
- Opening the browser print dialog.

## Not tested in this pass

Create, edit and status-change forms were not submitted again on the live books. Earlier phases recorded those flows. This pass confirmed the records those flows left behind, then stopped. A fresh Playwright profile only walked sign-in, the licence desk, a parking block, two seed parchis, command pagination and the QR fallback.

## Recommendation

The frontend can be walked through locally on http://localhost:5173 with the published password `demo-mandi`. That is a demonstration and UAT walkthrough of the browser, not a production release. Server-side authentication, authorisation and storage are still absent. Stop here until the next phase is approved.
