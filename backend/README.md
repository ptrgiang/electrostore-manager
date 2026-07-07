# ElectroStore Manager API

Express API for the ElectroStore Manager MVP.

## Local demo mode

The default `.env.example` uses `DATA_STORE=memory`, so the API can run without PostgreSQL:

```bash
npm install
npm run dev
```

Seed users:

- `manager@electrostore.local`
- `sales@electrostore.local`
- `warehouse@electrostore.local`

Password for all demo users: `Password123!`

## PostgreSQL mode

1. Create a database.
2. Run `database/schema.sql`.
3. Run `database/seed.sql`, or replace the included bcrypt hashes first if you want different demo passwords.
4. Run `database/seed.sql`.
5. Set `DATA_STORE=postgres` and `DATABASE_URL`.
