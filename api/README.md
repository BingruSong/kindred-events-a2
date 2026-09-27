# Database and API

Use MySQL 8.0 or later and Node.js 20 or later. Import `api/sql/charityevents.sql` with a MySQL account that can create the `charityevents_db` database. For example:

```powershell
mysql -u root -p --execute="source api/sql/charityevents.sql"
npm ci
$env:DB_USER = 'root'
$env:DB_PASSWORD = '<your local password>'
npm start
```

Open `http://localhost:3000/` after starting. `PORT`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` and `DB_NAME` can be set through environment variables. The defaults are port 3000, host `127.0.0.1`, MySQL port 3306, user `root`, empty password and database `charityevents_db`. Create a local database account with read-only rights for deployment; the application only issues `SELECT` queries.

The seed contains 10 published events across five categories, plus one unpublished draft used to verify that public queries exclude it. Import dates are relative to the UTC import date, so the sample remains usable when the project is set up later. Re-importing does not overwrite rows with the same IDs. All names, organisations, venues and events are fictional.

Endpoints:

- `GET /api/categories` returns an array of `{ id, name, description }`.
- `GET /api/events` returns an array of active events. Optional filters `upcoming=1`, `date=YYYY-MM-DD`, `location=text`, `category=id` combine with AND. `upcoming=1` includes active events whose end instant has not passed. `date` matches any event overlapping the selected `Australia/Brisbane` calendar day. `location` searches city and venue case-insensitively according to the database collation; `%` and `_` are treated as literal characters.
- `GET /api/events/:id` returns one active event, or HTTP 404 if absent or unpublished.

An event has `id`, `name`, UTC ISO strings `startsAt` and `endsAt`, `venue`, `city`, `purpose`, `description`, numeric `ticketPrice`, `fundraisingGoal`, `amountRaised`, `status`, `category` (an object with id, name and description), and `image` (a local SVG URL). A validation error uses HTTP 400. All API errors use `{ "error": { "code": "...", "message": "..." } }`.

Run `npm test` for request and filter tests. These use a database stub; an imported MySQL database must be checked separately with `mysql` and real API requests.
