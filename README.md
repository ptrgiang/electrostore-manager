# ElectroStore Manager

Smart POS & Inventory Management for Electronics Stores.

This repository implements the MVP described in `mvp.txt` using the branding in `branding.txt`.

## Apps

- `backend/`: Express API with JWT auth, RBAC, product/customer/inventory/warehouse/invoice/report endpoints, PostgreSQL schema, and memory demo mode.
- `frontend/`: React + Vite + TypeScript admin dashboard with role-based navigation and MVP pages.

## Quick start

```bash
npm install
npm run test
npm run build
```

Run the API and frontend in two terminals:

```bash
npm run dev:backend
npm run dev:frontend
```

Demo credentials:

- Manager: `manager@electrostore.manager`
- Salesperson: `sales@electrostore.manager`
- Warehouse staff: `warehouse@electrostore.manager`

Password for all demo users: `Password123!`

By default the backend uses `DATA_STORE=memory`, which is enough for local demos and automated tests. For PostgreSQL, apply `backend/database/schema.sql`, run `backend/database/seed.sql`, then set `DATA_STORE=postgres` and `DATABASE_URL`.
