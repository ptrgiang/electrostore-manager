# ElectroStore Manager

ElectroStore Manager is a modern SaaS-style store management system for small and medium electronics retailers. It combines POS, product management, customer records, inventory control, warehouse movements, invoices, reports, and staff administration in one internal dashboard.

This repository implements the MVP described in [`mvp.txt`](mvp.txt) using the brand direction in [`branding.txt`](branding.txt).

## Links

- Website: [https://electrostore-manager.vercel.app](https://electrostore-manager.vercel.app)
- Source code: [https://github.com/ptrgiang/electrostore-manager](https://github.com/ptrgiang/electrostore-manager)

## Tech stack

- Frontend: React 18, Vite, TypeScript, Tailwind CSS, React Router, TanStack Query, Recharts, Lucide icons
- Backend: Node.js, Express, JWT authentication, RBAC middleware, Zod validation
- Data stores: in-memory demo store by default, optional PostgreSQL mode
- Deployment: Vercel static frontend with serverless API rewrites through `api/index.js`

## Applications

- `frontend/`: role-based admin dashboard with Login, Dashboard, POS, Products, Customers, Inventory, Warehouse, Invoices, Reports, and Employees pages.
- `backend/`: Express API for authentication, products, customers, inventory, warehouse operations, invoices, reports, and employees.
- `api/`: Vercel entrypoint that serves the backend Express app as a serverless function.

## Main features

- Secure login with JWT access tokens and role-based navigation.
- Manager dashboard with KPI cards, revenue trend, top products, recent sales, and low-stock alerts.
- Cashier-oriented POS screen with product search, stock-aware product cards, editable cart rows, payment summary, amount received, change, and checkout.
- Product management with searchable tables, price and warranty data, stock thresholds, supplier info, and active/stopped status.
- Customer directory with purchase history, points, tiers, spending, and recent invoices.
- Inventory view with stock status filters, low-stock/out-of-stock indicators, and movement history access.
- Warehouse import/export workflows with selected product stock preview and recent stock movements.
- Invoice list with detail/refund actions and status-aware behavior.
- Reports for revenue by day, invoice count, top products, low-stock exceptions, and refunded invoices.
- Employee administration with role summaries and staff table.

## Roles and access

| Role | Default landing page | Main access |
| --- | --- | --- |
| Manager | Dashboard | All modules |
| Salesperson | POS | POS, Products, Customers, Inventory, Invoices |
| Warehouse Staff | Inventory | Products, Inventory, Warehouse |

## Demo accounts

All demo accounts use the same password:

```txt
Password123!
```

| Role | Email |
| --- | --- |
| Manager | `manager@electrostore.manager` |
| Salesperson | `sales@electrostore.manager` |
| Warehouse Staff | `warehouse@electrostore.manager` |
| POS Cashier | `cashier@electrostore.manager` |
| Inventory Clerk | `inventory@electrostore.manager` |

## Quick start

Install dependencies from the repository root:

```bash
npm install
```

Run the backend and frontend in two terminals:

```bash
npm run dev:backend
```

```bash
npm run dev:frontend
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`
- Health check: `http://localhost:5000/api/health`

## Environment

The backend can run without PostgreSQL by using the default in-memory data store:

```txt
DATA_STORE=memory
```

For PostgreSQL mode:

1. Create a PostgreSQL database.
2. Apply `backend/database/schema.sql`.
3. Seed data with `backend/database/seed.sql`.
4. Set:

```txt
DATA_STORE=postgres
DATABASE_URL=postgres://postgres:postgres@localhost:5432/electrostore_manager
```

Backend environment variables are documented in [`backend/.env.example`](backend/.env.example).

## Scripts

Run from the repository root:

| Command | Purpose |
| --- | --- |
| `npm install` | Install workspace dependencies |
| `npm run dev:backend` | Start the Express API locally |
| `npm run dev:frontend` | Start the Vite frontend locally |
| `npm run build` | Type-check and build the frontend |
| `npm test` | Run backend automated tests |

## API modules

The backend exposes these API groups under `/api`:

- `/api/health`
- `/api/auth`
- `/api/products`
- `/api/customers`
- `/api/inventory`
- `/api/warehouse`
- `/api/invoices`
- `/api/reports`
- `/api/employees`

## Deployment

The project is deployed on Vercel.

Important deployment files:

- `vercel.json`: frontend build output, API function config, and rewrites.
- `api/index.js`: Vercel serverless entrypoint for the Express app.
- `frontend/public/logo.svg`: website logo and favicon.

Production deployment command:

```bash
vercel --prod --yes
```

Production alias:

```txt
https://electrostore-manager.vercel.app
```

## Repository notes

- `.docx` files are ignored by Git because the system design report is maintained as a local deliverable.
- Generated screenshots and local dev logs should not be committed.
- The default memory store is intended for demos, tests, and quick local review. Use PostgreSQL for persistent data.
