# Role matrix

Sign in with password `demo-mandi`. Switching a role on `/roles` changes only the simulated sidebar stored in this browser. It does not identify an officer.

Field appears when the role has arrivals, trading, parking or facilities. Dashboard and Settings appear for every role.

| Desk | Role | Sidebar |
| --- | --- | --- |
| demo.super | Super Admin | Every module, including Field |
| demo.manager | Mandi Manager | Every module, including Field |
| demo.licence | Licence Officer | Stakeholders, Licences, Compliance, Reports |
| demo.accounts | Accounts Officer | Field, Licences, Trading, Finance, Reports |
| demo.aadathiya | Aadathiya | Field, Stakeholders, Licences, Produce Arrivals, Trading |
| demo.farmer | Farmer / Seller | Field, Licences, Produce Arrivals, Trading |
| demo.buyer | Buyer | Field, Licences, Produce Arrivals, Trading |
| demo.warehouse | Warehouse Operator | Field, Produce Arrivals, Warehouses |
| demo.cold | Cold Storage Operator | Field, Produce Arrivals, Cold Storage |
| demo.flp | FLP Operator | Field, Produce Arrivals, Post-Harvest |
| demo.parking | Parking / Transport Operator | Field, Parking & Transport |
| demo.facility | Facility Operator | Field, Facilities & Leasing |
| demo.inspector | Inspector / Auditor | Field, Licences, Warehouses, Cold Storage, Post-Harvest, Parking & Transport, Facilities & Leasing, Compliance, Reports |

The inspector can read compliance and cannot file an incident. Parking, facility, warehouse, cold and FLP operators can file the steps their own book allows. They cannot post finance. Accounts can post simulated finance notes. Nothing in any role collects money or issues an official licence.

Checked in the browser: the parking sidebar matched this table, and `/finance` opened `/unauthorized`. The session was returned to `demo.super`.
