# Route map

The public door is `/`. A signed-in desk starts at `/desk`. Vite is fixed to http://localhost:5173. Guest routes send a signed-in session to `/desk`. Unsigned desk routes send the browser to `/`.

## Public

| Path | Page |
| --- | --- |
| `/` | Introduction |
| `/login` | Demonstration sign-in |
| `/forgot-password` | Password reminder for the demo password |

## Shared desk

| Path | Page |
| --- | --- |
| `/desk` | Operating dashboard |
| `/profile` | Session profile |
| `/roles` | Role switcher |
| `/settings` | Theme, label and saved demo data |
| `/unauthorized` | Role refusal |
| `*` | Not found |

## Field

`/field`, `/field/arrival`, `/field/inspection`, `/field/parchi`, `/field/parking`, `/field/facilities`.

A role can open `/field` when it has arrivals, trading, parking or facilities. There is no separate field module.

## Stakeholders

Under `/stakeholders`: `farmers`, `buyers`, `aadathiyas`, `transporters`, `warehouse-operators`, `facility-operators`, `commodities`, `grades`, `units`, `locations`, `fees`. Each register has a list, `new`, `:id` and `:id/edit`.

## Licences

`/licences` plus `apply`, `applications`, `verify`, `approvals`, `fees`, `issue`, `register`, `alerts`, `renew/:id`, `modify/:id`, `:id` and `:id/print`.

## Arrivals

`/arrivals` plus `new`, `register`, `crates`, `:id` and `:id/print`.

## Trading

`/trading` plus `arrivals`, `requirements`, `lots`, `workspace`, `discover`, `discover/:lotId`, `negotiations`, `commission`, `charges`, `register`, `payments`, `:id`, `:id/seller-parchi` and `:id/buyer-parchi`.

## Finance

`/finance` plus `fees`, `deposits`, `commission`, `collections`, `seller-payments`, `credit-notes`, `debit-notes`, `receipts`, `receipts/:id/print`, `receivables`, `reconciliation`, `closing` and `reports`.

## Warehouses

`/warehouses` plus `directory`, `apply`, `contracts`, `contracts/:id`, `contracts/:id/print`, `inward`, `outward`, `inventory`, `occupancy`, `cleaning`, `fire`, `security`, `insurance`, `maintenance` and `alerts`.

## Cold storage

`/cold-storage` plus `directory`, `apply`, `contracts`, `contracts/:id`, `contracts/:id/print`, `allocation`, `inward`, `outward`, `temperature`, `temperature/entry`, `temperature/history`, `gas`, `fire`, `hygiene`, `security`, `insurance`, `maintenance`, `incidents` and `alerts`.

## Post-harvest

`/post-harvest` plus `directory`, `intake`, `batches`, `batches/:id`, `sorting`, `packaging`, `output`, `movement`, `cleaning`, `maintenance`, `safety`, `insurance`, `incidents` and `reports`.

## Parking and transport

`/parking` plus `apply`, `contracts`, `contracts/:id`, `vehicles`, `entry`, `exit`, `allocation`, `occupancy`, `fees`, `movements`, `passes/:id`, `offices`, `offices/apply`, `offices/:id`, `offices/:id/print`, `charges` and `alerts`.

## Facilities

`/facilities` plus `kisan`, `hotel`, `restaurant`, `apply/:kind`, `leases/:id`, `leases/:id/print`, `deposits`, `rent`, `register`, `stays`, `cleaning`, `fire`, `hygiene`, `operations`, `maintenance`, `insurance` and `alerts`.

## Compliance and reports

`/compliance` plus `matrix`, `matrix/:number`, `licences`, `trading`, `finance`, `warehouses`, `cold-storage`, `parking`, `expiry`, `approvals`, `incidents`, `calendar`, `actions` and `audit`.

`/reports` prepares demo CSV files in the browser.
