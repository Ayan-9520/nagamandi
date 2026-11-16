# Demo user guide

This is a browser demonstration of a mandi desk. It does not grant a licence, take a payment, or connect to a bank, a probe, or a government system.

## Start

1. From the project folder, run `npm run dev`.
2. Open http://localhost:5173.
3. Continue to the desk and sign in. The demonstration password is `demo-mandi`.
4. Choose a desk on `/roles`. `demo.super` sees every module.

The working mandi is Dimapur Central. Desk codes such as DG-14, AD-02 and GS-14 are labels, not personal names. The sample day used by alerts is 14 Nov 2026.

## What you can walk through

- Stakeholders and the commodity catalogue.
- A licence case from application through a simulated fee and a printable preview.
- A gate arrival, a lot, and an arrival slip.
- A written trade, seller and buyer parchis, and fictional charges.
- A finance book of receipts, notes, reconciliation and a day close. Amounts stay in this browser.
- Warehouse, cold storage, post-harvest, parking and facility books, including checklists and printable contract previews.
- The command centre for SOP-001 to SOP-015, and demo CSV reports.
- The field desk at `/field`, including drafts that stay on the device while offline.

Print buttons call the browser print dialog. They do not send a document anywhere.

## What stays on this computer

Registers, books and field drafts are stored in localStorage under keys beginning `naga-mandi-os.`. Refreshing the page keeps them. Settings can clear saved demo preferences. That action leaves the operating books and field drafts in place. Each book has its own restore control.

## Offline field work

The field desk saves drafts only. Sync writes a draft into a book when the browser is online and the underlying record has not changed. A changed record is shown as a conflict and is not overwritten. Payments, licences, financial postings and approvals are not completed offline.

## Install

The manifest and service worker make the desk installable from the browser. That install is still this frontend. It is not a native Android application.
