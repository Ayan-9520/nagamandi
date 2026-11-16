# Print and QR test report

Print buttons were visible and were not clicked, so no print dialog was left open. Each row below rendered a `.print-sheet` in the signed-in browser unless noted.

| Document | Address | Heading observed | Mark |
| --- | --- | --- | --- |
| Seller parchi | `/trading/DEMO-TRD-6201/seller-parchi` | Seller parchi | `DEMO-PRC-S-6201`, 16 Nov 2026, sale ₹16,000.00, commission −₹320.00, net ₹15,680.00. Not a receipt. |
| Buyer parchi | `/trading/DEMO-TRD-6201/buyer-parchi` | Buyer parchi | `DEMO-PRC-B-6201`. Not a receipt. |
| Seller parchi | `/trading/DEMO-TRD-6101/seller-parchi` | Seller parchi | `DEMO-PRC-S-6101`, 14 Nov 2026. |
| Buyer parchi | `/trading/DEMO-TRD-6101/buyer-parchi` | Buyer parchi | `DEMO-PRC-B-6101`. |
| Licence | `/licences/DEMO-APP-8001/print` | Demonstration licence | `DEMO-LIC-FS-8006`, desk code CSV-88. Not a permit. |
| Receipt | `/finance/receipts/DEMO-FIN-7201/print` | Payment receipt | `DEMO-FIN-7201`. Text says no money was received. |
| Credit note | `/finance/notes/DEMO-CRN-7201/print` | Credit note | `DEMO-CRN-7201`, ₹15,680.00, status Cancelled. Text says the note does not move money. |
| Debit note | `/finance/notes/DEMO-DBN-7101/print` | Debit note | `DEMO-DBN-7101`, ₹1,000.00, status Collected. |
| Warehouse contract | `/warehouses/contracts/DEMO-WHC-8101/print` | Warehouse contract | `DEMO-WHC-8101`, WH-D1, issued. Not a deed. |
| Cold storage contract | `/cold-storage/contracts/DEMO-CSC-9101/print` | Cold storage contract | `DEMO-CSC-9101`, CS-D1, issued. |
| Hotel lease | `/facilities/leases/DEMO-FCL-12103/print` | Hotel lease | `DEMO-FCL-12103`, HT-D2. |
| Transport office lease | `/parking/offices/DEMO-TOL-11101/print` | Transport office lease | `DEMO-TOL-11101`, TO-D1, issued. |
| Arrival slip | `/arrivals/DEMO-ARR-5201/print` | Arrival slip | `DEMO-LOT-5201`. Not a gate pass. |
| Vehicle entry pass | `/parking/passes/DEMO-PKP-11101` | Vehicle entry pass | `DEMO-PKP-11101`, NL07-DEMO-214, slot A1, inside. Not a gate pass. |

Playwright, in its own browser profile, also opened the seed seller and buyer parchi for `DEMO-TRD-6101` and saw the print button. It did not print.

A restaurant lease print was not opened. That row is NOT TESTED.

## QR

The field desk at `/field` keeps a demonstration-code field and a “Use typed code” button. “Scan QR” in the signed-in browser set the note to “QR scanning is not supported in this browser.” The camera was not opened. Playwright asserted the same fallback: either the unsupported message or the camera-unavailable message, plus the typed-code button.

`BarcodeDetector` is absent in this browser. Typed entry is the working path. No live camera scan was performed.
