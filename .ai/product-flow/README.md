# Product Flow Acceptance

This folder tracks product-flow validation that must stay separate from vendor PDF RAG acceptance.

## Scope

- Hotinfo upload, parsing, profile persistence, and ticket snapshot behavior.
- Customer-facing AI diagnosis with Hotinfo context.
- AI-optional ticket creation.
- Basic admin/customer authorization checks around Hotinfo and created tickets.

## Out of Scope

- Vendor PDF retrieval quality. Use `.ai/rag-quality/` for that.
- Bulk dataset import.
- Destructive database cleanup.

## Commands

```bash
node .ai/product-flow/run-product-flow-acceptance.mjs
```

The runner uses localhost API defaults:

- Backend: `http://localhost:4000/api/v1`
- Customer: `e2e-customer@aluplan.test`
- Admin: `e2e-admin@aluplan.test`

It creates a uniquely tagged test ticket so the acceptance evidence can be traced later.
