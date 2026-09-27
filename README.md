# Kindred Events

Kindred Events is a fictional charity event discovery site built for PROG2002 A2. It uses MySQL 8, Node.js 20+, Express, HTML, CSS and browser JavaScript. The home, search and detail pages read all event data from the API. Every event and organisation is invented; the twelve SVG illustrations are original project assets.

## Start locally

1. Install MySQL 8 and Node.js 20 or later.
2. Import `api/sql/charityevents.sql` into MySQL with an account allowed to create `charityevents_db`.
3. In this directory run `npm ci`.
4. Set `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and optionally `DB_NAME` in your local shell. The database name defaults to `charityevents_db`.
5. Run `npm start`, then open `http://localhost:3000/`.

For example, in PowerShell:

```powershell
mysql -u root -p --execute="source api/sql/charityevents.sql"
npm ci
$env:DB_USER = 'your_local_user'
$env:DB_PASSWORD = 'your_local_password'
npm start
```

Set up a read-only database user for serving the site when practical. Do not commit local passwords. The server checks its database connection before listening; if it cannot connect, it exits with an error instead of showing a misleading empty event list.

## API and verification

See [api/README.md](api/README.md) for endpoint semantics and validation. `npm test` runs route and filter tests using a database stub. A live MySQL import and API request are still necessary to verify the complete stack. The database seed uses dates relative to import day, so the displayed calendar dates depend on when it is imported.

The supplied report template is filled at `docs/PROG2002 A2 Report.docx`; its identity fields remain blank. `docs/VIDEO-SCRIPT.md` supports a student-recorded demonstration. Submission archives are produced by `tools/package_submission.py`. A student must confirm the course's AI disclosure rules, record and upload the video, and submit the final files.
