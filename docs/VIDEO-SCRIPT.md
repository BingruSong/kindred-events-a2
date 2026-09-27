# Kindred Events demonstration guide

This is a practice script for a student-recorded video. Target spoken English plus screen actions: about 11–13 minutes, leaving room below the 15-minute limit. The Chinese lines explain the same narration for rehearsal; they are not a second spoken track. Confirm the final duration by recording a timed rehearsal. Replace any displayed database credentials with a safe local account before screen capture.

## 0:00–1:00 Introduction

**Screen action:** Open `clientside/index.html` through the running Express server at `http://localhost:3000/`. Show the navigation and first event cards.

**Speak (English):** “Kindred Events is a fictional charity event discovery website. It helps visitors browse upcoming activities, filter by date, location and cause, and read an event's details and fundraising progress. This assessment implements information discovery. Registration currently displays the required construction message.”

**中文理解：** Kindred Events 是虚构的慈善活动发现网站。用户可以浏览未来活动，用日期、地点和类别筛选，查看活动详情与筹款进度。本阶段只实现信息浏览；报名按钮显示施工提示。

## 1:00–3:00 Data model and sample data

**Screen action:** Open `api/sql/charityevents.sql`. Point to `CREATE DATABASE`, `categories`, `events`, the primary and foreign keys, the money and date checks, and the seed insert. In MySQL, run `SELECT COUNT(*) FROM charityevents_db.events;` and `SELECT c.name, COUNT(*) FROM charityevents_db.events e JOIN charityevents_db.categories c ON c.id=e.category_id GROUP BY c.id, c.name;` after importing. Show the actual output; do not state a result if import failed.

**Speak (English):** “The database is named charityevents_db. A category can have many events, and event.category_id is a foreign key to categories.id. Each event stores its time, venue, purpose, description, ticket price, fundraising goal, amount raised, status and illustration path. Monetary fields use DECIMAL. The seed uses relative dates so newly imported sample events remain useful. Draft events are excluded from the public API.”

**中文理解：** 数据库名为 charityevents_db。一个类别对应多个活动，外键连接两张表。活动保存页面所需字段，金额使用 DECIMAL。种子日期相对导入日生成；草稿不进入公开接口。

## 3:00–5:00 API and a live request

**Screen action:** Show `api/event_db.js`, then `api/filters.js` and `api/app.js`. Highlight parameter placeholders and validation. In a browser or API client, request `/api/categories`, `/api/events?upcoming=1`, then `/api/events?upcoming=1&location=Brisbane&category=1`. Open one returned event via `/api/events/1`. For an error example request `/api/events?date=2026-02-30`. Display the real status and JSON.

**Speak (English):** “Express reads MySQL through event_db.js. The collection endpoint handles the home page and search. Filters combine with AND, and user values are bound as query parameters. Date filtering matches events that overlap the chosen Brisbane calendar day; stored instants are UTC. The detail endpoint looks up an active event by ID. Invalid input returns HTTP 400, a missing or draft event returns 404, and database failure returns 500.”

**中文理解：** Express 通过 event_db.js 查询 MySQL。活动集合接口同时服务首页和搜索；筛选条件使用 AND，输入通过参数绑定。日期按布里斯班自然日匹配，数据库时间为 UTC。无效参数返回 400，不存在或草稿活动返回 404，数据库故障返回 500。

## 5:00–7:00 Browser-to-DOM data flow

**Screen action:** Open browser developer tools Network panel. Refresh home and point to `/api/events?upcoming=1` and its response. Show `clientside/js/app.js` `getJSON`, `initHome`, `card`, and `renderCards`.

**Speak (English):** “On page load, fetch returns a Promise. The code checks the HTTP response, parses JSON, and creates card elements in the DOM. The event text uses textContent so data is displayed as text. The page has separate loading, empty and error states with a retry action. This is dynamic data from the API rather than a hard-coded event list in HTML.”

**中文理解：** 页面加载时 fetch 返回 Promise。代码检查响应、解析 JSON，并创建活动卡片 DOM。文字通过 textContent 安全呈现。加载、无结果、错误与重试有不同状态；HTML 中没有写死活动列表。

## 7:00–9:30 Search interactions

**Screen action:** Open `search.html`. Choose category Environment and type Brisbane. Submit; show the URL and matching cards. Add a date obtained from one result's displayed event date, submit again, then use Clear Filters. Show an impossible location to demonstrate the empty state. Use browser Back to show state restoration.

**Speak (English):** “The search page loads cause options from `/api/categories`. The selected values form a request to `/api/events`. The URL records the filters so back and forward navigation can restore the search. Clear Filters resets both the controls and results. If a newer search starts before an older one finishes, the older request is aborted and cannot overwrite the newer result.”

**中文理解：** 类别选项来自 API。所选条件组合成请求，并写入 URL，方便返回和前进恢复。Clear Filters 同时重置表单与结果。新请求开始时取消旧请求，避免旧结果覆盖新结果。

## 9:30–11:00 Event detail and registration notice

**Screen action:** Open a card. Show its ID in the URL, the description, time, venue, free or paid ticket, goal and raised amount. Click Register interest and show the dialog. Close it with Escape and with the close button. Open `detail.html?id=not-an-id` to show invalid-link handling.

**Speak (English):** “The selected event ID is sent to `/api/events/:id`, so this page displays only that record. The fundraising bar and amounts come from the response. The Register button does not take payment or save a registration in A2. It shows the exact required message: ‘This feature is currently under construction.’ An invalid link shows a clear error.”

**中文理解：** 详情页将所选 ID 传给接口，因此只展示该活动。筹款数字由响应提供。A2 不处理支付或报名；按钮展示题目要求的原文提示。无效链接有明确提示。

## 11:00–12:30 Verification and close

**Screen action:** Run `npm test`; show the actual result. Briefly show the report's data schema and API design answers, then return to the site. If available, demonstrate the page at a narrow browser width. Keep the final recording under 15 minutes.

**Speak (English):** “The automated tests cover filter validation and route responses using a database stub. I also checked the browser flow. Before submission, I verify the SQL import and repeat these requests against a live MySQL database, then confirm the private repository and video link can be accessed by the teacher.”

**中文理解：** 自动测试用数据库替身检查筛选校验和接口响应；浏览器流程也做过检查。提交前仍需用真实 MySQL 导入、复测接口，并确认教师可访问私有仓库与视频链接。
