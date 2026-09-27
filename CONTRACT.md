# Implementation contract

- Database: `charityevents_db`, MySQL, imported from `api/sql/charityevents.sql`.
- Time: UTC instants in API ISO 8601; frontend formats in `Australia/Brisbane`. An event is available when `ends_at >= NOW()` and `status = 'active'`.
- `GET /api/events?upcoming=1&date=YYYY-MM-DD&location=text&category=id`: active events, optional AND filters. Date matches an event overlapping that Brisbane calendar day. Location searches city and venue. Results include summary fields and category.
- `GET /api/categories`: category id, name and description.
- `GET /api/events/:id`: active event detail; inactive or absent IDs return 404.
- Error envelope: `{ "error": { "code": "...", "message": "..." } }`.
- Event fields: `id`, `name`, `startsAt`, `endsAt`, `venue`, `city`, `purpose`, `description`, `ticketPrice`, `fundraisingGoal`, `amountRaised`, `status`, `category`, `image`.
- Frontend is served as static HTML/CSS/JS from `clientside/`; API base URL defaults to `/api` for same-origin operation.
- Register displays the exact text `This feature is currently under construction.`
- All organizations and events are fictional. Illustrations are original SVG assets, labelled as illustrations.
