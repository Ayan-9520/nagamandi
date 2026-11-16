# Backend integration plan

This document is a plan only. No backend is implemented. The running desk at http://localhost:5173 reads and writes localStorage.

## Current boundary

Each book is a Zustand store with a persist key:

- `naga-mandi-os.registry`
- `naga-mandi-os.licences`
- `naga-mandi-os.arrivals`
- `naga-mandi-os.trades`
- `naga-mandi-os.finance`
- `naga-mandi-os.warehouses`
- `naga-mandi-os.cold-storage`
- `naga-mandi-os.flp`
- `naga-mandi-os.parking`
- `naga-mandi-os.facilities`
- `naga-mandi-os.compliance`
- `naga-mandi-os.field`
- `naga-mandi-os.session`, `naga-mandi-os.ui`, `naga-mandi-os.demo`

Money is integer paise. Status values are fixed string unions. Records carry `mandiId`. The session password is a shared demonstration string, not an account system.

## What a later service would replace

1. Replace each persist store with an API client that returns the same record shapes. Keep the page components on those shapes so the screens do not change first.
2. Replace `signInDemo` with an identity provider. Map the thirteen demonstration roles onto real permissions, and keep the route checks in one place.
3. Move licence issue, finance posting, warehouse and facility issue, and compliance close behind server rules. The browser should display the result, not decide that a licence was issued.
4. Keep field drafts local until sync. The server should reject a sync when the record version changed, using the same conflict message the desk already shows.
5. Store files that are now data URLs as documents with size limits. Do not treat a printed page as a filed original.
6. Leave the yard-sample chart as demonstration content, or remove it when live figures exist. Do not mix it into book totals.

## What must stay simulated until a service exists

Payments, receipts, deposits, commissions, settlements, licence numbers, leases, parking fees, and audit rows are labels in the browser. Connecting a payment gateway, a bank, a licence authority, or an IoT probe is out of scope for this frontend.
