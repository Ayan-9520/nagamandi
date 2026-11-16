# Role access test report

The checks below are frontend UI restrictions. The route guard and sidebar read the role stored in this browser. There is no server, session cookie or authorisation API. Anyone who can edit `localStorage` can change the simulated role. Do not treat this as security.

Switching a role writes only the session record. After the walk, the session was restored to `demo.super` / `super-admin` and a reload kept that session. Other books were not cleared.

Each role was opened from Role selection. The dashboard heading and the primary sidebar were read. For every role that the permission map blocks from at least one probe path, that path was opened and the page title was “Outside this role” at `/unauthorized`. The unauthorised page text did not contain `DEMO-FIN-`, `DEMO-TRD-` or a rupee amount.

Probe paths were Stakeholders, Licences, Arrivals, Trading, Finance, Warehouses, Cold Storage, Post-Harvest, Parking, Facilities, Compliance, Reports and Field. Super Admin and Mandi Manager are allowed on all of those, so they have no unauthorised row.

| Desk | Role | Dashboard heading | Sidebar | Unauthorised check |
| --- | --- | --- | --- | --- |
| demo.super | Super Admin | Super Admin, confirmed again on `/desk` after the walk | Dashboard, Field, Stakeholders, Licences, Produce Arrivals, Trading, Finance, Warehouses, Cold Storage, Post-Harvest, Parking & Transport, Facilities & Leasing, Compliance, Reports, Settings | Not applicable. Every probe path is allowed. |
| demo.manager | Mandi Manager | Mandi Manager | Same 15 items as Super Admin | Not applicable. |
| demo.licence | Licence Officer | Licence Officer | Dashboard, Stakeholders, Licences, Compliance, Reports, Settings. Field is absent. | PASS. `/arrivals` → Outside this role. No finance or trade identifiers. |
| demo.accounts | Accounts Officer | Accounts Officer | Dashboard, Field, Licences, Trading, Finance, Reports, Settings | PASS. `/stakeholders` → Outside this role. |
| demo.aadathiya | Aadathiya | Aadathiya | Dashboard, Field, Stakeholders, Licences, Produce Arrivals, Trading, Settings | PASS. `/finance` → Outside this role. |
| demo.farmer | Farmer / Seller | Farmer / Seller | Dashboard, Field, Licences, Produce Arrivals, Trading, Settings | PASS. `/stakeholders` → Outside this role. |
| demo.buyer | Buyer | Buyer | Dashboard, Field, Licences, Produce Arrivals, Trading, Settings | PASS. `/stakeholders` → Outside this role. |
| demo.warehouse | Warehouse Operator | Warehouse Operator | Dashboard, Field, Produce Arrivals, Warehouses, Settings | PASS. `/stakeholders` → Outside this role. |
| demo.cold | Cold Storage Operator | Cold Storage Operator | Dashboard, Field, Produce Arrivals, Cold Storage, Settings | PASS. `/stakeholders` → Outside this role. |
| demo.flp | FLP Operator | FLP Operator | Dashboard, Field, Produce Arrivals, Post-Harvest, Settings | PASS. `/stakeholders` → Outside this role. |
| demo.parking | Parking / Transport Operator | Parking / Transport Operator | Dashboard, Field, Parking & Transport, Settings | PASS. `/stakeholders` → Outside this role. Playwright, in a fresh profile, also sent `/finance` to `/unauthorized`. |
| demo.facility | Facility Operator | Facility Operator | Dashboard, Field, Facilities & Leasing, Settings | PASS. `/stakeholders` → Outside this role. |
| demo.inspector | Inspector / Auditor | Inspector / Auditor | Dashboard, Field, Licences, Warehouses, Cold Storage, Post-Harvest, Parking & Transport, Facilities & Leasing, Compliance, Reports, Settings | PASS. `/stakeholders` → Outside this role. The sidebar does not include Trading or Finance. |

Role-specific actions that post a record were not clicked. Inspector compliance remains read-only in the permission map; this pass did not file an incident. Parking field links were not re-opened in this phase; Phase 15 already recorded that the parking desk shows Park and not Arrive.

Password for every desk remains the published demonstration password `demo-mandi`.
