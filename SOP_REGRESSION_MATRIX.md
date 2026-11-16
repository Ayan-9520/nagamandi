# SOP regression matrix

Phase 16 checked screens, existing records and print layouts. It did not submit new forms on the signed-in books, and it did not post fees, deposits, collections or settlements.

Statuses mean:

- **PASS** — observed in this pass, on the signed-in browser unless the note says Playwright.
- **FAIL** — observed and wrong.
- **BLOCKED** — a mutating finance step that this pass was not allowed to run on the live book.
- **NOT TESTED** — not repeated in this pass. An earlier phase may have exercised it.

No SOP row failed.

| SOP | Screens and navigation | View existing records | Create, edit, status change | Role gate | Persistence after refresh | Generated document | Empty or invalid data |
| --- | --- | --- | --- | --- | --- | --- | --- |
| SOP-001 Licence issue | PASS. Licence desk heading in Playwright. Issued licence print opened. | PASS. `DEMO-APP-8001` is issued and prints `DEMO-LIC-FS-8006`. | NOT TESTED. New fee posting is BLOCKED. | PASS. Licence officer sidebar is Dashboard, Stakeholders, Licences, Compliance, Reports, Settings. `/arrivals` went to “Outside this role”. | PASS. Licence key still present after reload. | PASS. Demonstration licence sheet. Print not clicked. | NOT TESTED on the application form. Playwright rejected an empty sign-in. |
| SOP-002 Mandi sales | PASS. Trade register and seller parchis opened. | PASS. `DEMO-TRD-6101` and `DEMO-TRD-6201` seller parchis. | NOT TESTED. | PASS. Farmer and buyer sidebars include Trading. Accounts includes Trading and Finance. | PASS. Trade key still present. | PASS. Seller parchi sheets, including Playwright on a fresh profile for `DEMO-TRD-6101`. | NOT TESTED. |
| SOP-003 Mandi buying | PASS. Buyer parchis opened from the same trades. | PASS. `DEMO-PRC-B-6101` and `DEMO-PRC-B-6201`. | NOT TESTED. | PASS. Same trading roles as SOP-002. Aadathiya opening `/finance` was refused. | PASS. | PASS. Buyer parchi sheets. | NOT TESTED. |
| SOP-004 Warehouse contract award | PASS. Contract print and expiry alerts opened. | PASS. `DEMO-WHC-8101` issued for WH-D1. Alerts showed 2 rows. | NOT TESTED. | PASS. Warehouse operator sidebar includes Warehouses and not Finance. | PASS. Warehouse key still present. | PASS. Warehouse contract sheet. | NOT TESTED. |
| SOP-005 Warehouse operations | PASS. Cleaning checklist opened. | PASS. WH-D1 cleaning form is on screen. “Showing 1–1 of 1”. | NOT TESTED. | PASS. Warehouse operator can open the warehouse module. | PASS. | NOT TESTED. No warehouse operations print was opened. | NOT TESTED. |
| SOP-006 Cold storage contract award | PASS. Cold contract print opened. | PASS. `DEMO-CSC-9101` issued for CS-D1. | NOT TESTED. | PASS. Cold storage operator sidebar includes Cold Storage. | PASS. Cold-storage key still present. | PASS. Cold storage contract sheet. | NOT TESTED. |
| SOP-007 Cold storage operations | NOT TESTED. The operations checklist was not opened in this pass. | NOT TESTED. | NOT TESTED. | PASS. Cold storage operator does not see Stakeholders; that route was refused. | PASS. The cold-storage book survived reload. | NOT TESTED. | NOT TESTED. |
| SOP-008 Post-harvest and FLP | NOT TESTED. The FLP screens were not opened in this pass. | NOT TESTED. | NOT TESTED. | PASS. FLP operator sidebar is Dashboard, Field, Produce Arrivals, Post-Harvest, Settings. | PASS. FLP key still present. | NOT TESTED. | NOT TESTED. |
| SOP-009 Parking contract | NOT TESTED as a separate contract screen. | NOT TESTED. | NOT TESTED. | PASS. Parking operator sidebar is Dashboard, Field, Parking & Transport, Settings. Playwright sent `/finance` to `/unauthorized`. | PASS. Parking key still present. | NOT TESTED. | NOT TESTED. |
| SOP-010 Vehicle parking | PASS. Entry pass opened. | PASS. `DEMO-PKP-11101` for NL07-DEMO-214, slot A1, status inside. | NOT TESTED. The saved exit draft was not synced. | PASS. Parking operator. | PASS. Five field drafts unchanged, including the unsynced exit draft. | PASS. Vehicle entry pass sheet. | NOT TESTED. |
| SOP-011 Transport office lease | PASS. Office lease print opened. | PASS. `DEMO-TOL-11101`, office TO-D1, issued. | NOT TESTED. | PASS. Parking operator. | PASS. | PASS. Transport office lease sheet. | NOT TESTED. |
| SOP-012 Kisan Bhavan and hotel lease | PASS. Hotel lease print opened. | PASS. `DEMO-FCL-12103`, site HT-D2, issued. | NOT TESTED. | PASS. Facility operator sidebar is Dashboard, Field, Facilities & Leasing, Settings. | PASS. Facilities key still present. | PASS. Hotel lease sheet. | NOT TESTED. |
| SOP-013 Kisan Bhavan and hotel operations | NOT TESTED. The inspection form was not submitted. | NOT TESTED beyond the unsynced field draft `DEMO-FLD-14205` still being stored. | NOT TESTED. | PASS. Facility operator and inspector both include Facilities. | PASS. Draft status remained `saved`. | NOT TESTED. | NOT TESTED. |
| SOP-014 Restaurant lease | NOT TESTED. A restaurant lease print was not opened. | NOT TESTED. | NOT TESTED. | PASS. Facility operator can open Facilities. | PASS. Facilities book survived reload. | NOT TESTED. | NOT TESTED. |
| SOP-015 Restaurant operations | NOT TESTED. | NOT TESTED. | NOT TESTED. | PASS. Same facilities gate as SOP-014. | PASS. | NOT TESTED. | NOT TESTED. |

Command centre, which reads these procedures, is PASS for the live matrix: 7 on track / 6 attention / 2 exception were on the summary, 15 procedure rows paged, 1 open incident and 7 pending approvals.

Playwright’s fresh profile uses each store’s first sample. Those passes are not a second copy of the signed-in Dimapur books.
