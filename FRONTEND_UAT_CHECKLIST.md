# Frontend UAT checklist

Use http://localhost:5173 and the password `demo-mandi`. This checklist is for a supervised demonstration. It is not a production acceptance certificate.

The signed-in books were not reset during Phase 16. A walker should not use “clear demo data”, “Restore finance sample”, or “Restore facilities sample” if those books should stay as they are.

## Ready to walk through

- [x] Introduction opens and links to sign-in. Playwright clicked the banner “Enter the desk”.
- [x] Empty sign-in shows “Choose a demonstration desk.” Playwright.
- [x] Super Admin reaches a dashboard headed Super Admin.
- [x] Licence desk opens. Playwright.
- [x] All 13 roles show their own sidebar. Restricted routes show “Outside this role” and do not show finance or trade identifiers.
- [x] Session returns to Super Admin and survives a reload.
- [x] 15 browser keys and the five field drafts remain after reload.
- [x] Finance totals still read licence fees ₹20,800.00, security available ₹74,000.00, commission ₹1,563.60, buyer outstanding ₹52,114.20.
- [x] Seller and buyer parchis, licence, receipt, credit note, debit note, warehouse contract, cold contract, hotel lease, office lease, arrival slip and vehicle pass render a print sheet.
- [x] Command centre pages 15 procedures, four at a time, and shows the open incident and pending-approval counts.
- [x] Field desk accepts a typed code and explains that this browser did not open the camera.
- [x] Layout holds at 390×844, 768×1024 and 1280×800 without a wider document.
- [x] `npm run build` and `npm run lint` exit 0. Lint has 22 warnings.
- [x] Playwright: 4 passed, 0 failed, isolated from the signed-in books.

## Do not mark done

- [ ] Production readiness. Not claimed.
- [ ] Server-side sign-in or authorisation. Not built.
- [ ] A repeated create, edit and status change for every SOP on the live books. Not run in this pass.
- [ ] A new fee, deposit, collection or settlement. Blocked so the current finance book stays intact.
- [ ] Browser print dialog. Buttons are present and were not pressed.
- [ ] A camera QR scan. This browser has no `BarcodeDetector`.
- [ ] Restaurant lease print, cold-storage operations checklist, FLP screens, and restaurant operations. Not opened in this pass.
- [ ] Krishora, a backend, a database or a native app. Out of scope. Stop after this phase.
