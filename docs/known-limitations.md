# Known limitations

- `local/sample` mode is the default because live API keys and a database are not configured in this workspace.
- OD grain is modeled as mixed-grain capable, but live grain verification is still pending.
- Postgres migrations and seeds are present, but live DB application is gated behind `DATABASE_URL`.
- Deployment documentation is ready, but no live Vercel deployment has been verified from this workspace.
