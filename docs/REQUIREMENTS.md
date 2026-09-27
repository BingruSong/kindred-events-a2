# Assessment requirements and evidence plan

The original A2 brief is the source of course requirements. The supplied handoff adds implementation advice; its claims are not treated as proof of completed work or official AI policy.

| Requirement from brief | Planned evidence |
| --- | --- |
| MySQL `charityevents_db`, suitable keys and relationships, at least eight events across categories | `api/sql/charityevents.sql`, import and row-count check |
| `event_db.js` connects Node.js to MySQL | `api/event_db.js`, startup and API integration check |
| Express read API: upcoming events, search by date/location/category, categories, detail | API routes plus valid, invalid and combined-filter requests |
| Dynamic home, search and detail pages using HTML, JavaScript, DOM and Promises | Browser checks against the live API and network log |
| Clear Filters and understandable DOM errors | Search interaction checks |
| Register construction notice | Exact string check in detail interaction |
| Report in supplied template | Filled DOCX and visual render |
| Authentic GitHub history and restricted visibility to other students | Dated commits and repository URL; current public setting conflicts with this brief requirement because the user explicitly requested public access |
| Demonstration video of 15 minutes or less | Bilingual practice script; student-owned recording and OneDrive link remain to be supplied |
| Two named ZIP archives | Extract and run check, with username placeholder until the correct username is confirmed |

Interpretations to document: active events with an end time in the future count as current/upcoming; date search matches Brisbane calendar dates an event overlaps; filters combine with AND; suspended events are absent from search and detail. These are implementation decisions because the original brief does not specify those edges.

The original document contains an empty “GenAI Use Level” field. The user states there is no restriction. That statement is not independent proof of course policy; no official authorization is claimed in the report.
