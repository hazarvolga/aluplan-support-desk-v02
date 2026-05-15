# Product Flow Acceptance Results - 2026-05-15 Phase 1

## Summary

- Mode: localhost API validation
- Endpoint base: `http://localhost:4000/api/v1`
- Runner: `.ai/product-flow/run-product-flow-acceptance.mjs`
- Result:
  - 9 total
  - 9 pass
  - 0 fail

## Passed Checks

- `product-health-001`
  - backend health returned `200`.
- `product-hotinfo-upload-001`
  - customer uploaded `_hotinf_.hxl`.
  - parsed Hotinfo included:
    - Allplan version: `Allplan 2026`
    - OS: `Windows 11 (24H2 - Build 26100)`
    - GPU: `NVIDIA RTX 4070`
    - conflicting process: `onedrive.exe`
- `product-hotinfo-profile-001`
  - `/auth/me` returned persisted `customerProfile.hotinfoData`.
- `product-hotinfo-ai-context-001`
  - `/ai/query?wait=true` accepted Hotinfo context.
  - answer returned `200`, `MEDIUM`, `FALLBACK`.
  - raw trace `_SEC.NSE` did not leak into the customer answer.
- `product-ticket-no-ai-001`
  - customer created a ticket without prior AI interaction.
  - created ticket: `SUP-01018`.
  - `interactionId` remained `null`.
- `product-ticket-customer-read-001`
  - customer could read the created ticket.
- `product-ticket-hotinfo-snapshot-001`
  - created ticket persisted Hotinfo as ticket-specific `hotinfoSnapshot`.
  - admin read confirmed snapshot fields.
- `product-hotinfo-rbac-customer-download-001`
  - customer direct raw Hotinfo download was forbidden with `403`.
- `product-hotinfo-rbac-admin-download-001`
  - admin raw Hotinfo download returned `200` with XML content.

## Security Notes

- Hotinfo raw download is support/admin-only.
- Customer AI answer did not echo raw trace path data.
- Hotinfo remains ticket/profile context; this phase did not import Hotinfo into vendor PDF RAG.

## Decision

Faz 1 is complete. The current product flow supports:

- Hotinfo upload and profile persistence.
- Hotinfo use as AI context without raw trace leakage.
- AI-optional ticket creation.
- Ticket-level Hotinfo snapshot persistence.
- Basic Hotinfo raw download RBAC.

Next phase should be browser/UI verification for the same flow:

- customer uploads `.hxl`.
- customer can proceed without AI.
- customer can create ticket.
- admin receives/sees the ticket and Hotinfo snapshot.
