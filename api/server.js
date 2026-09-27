'use strict';

const { makeApp } = require('./app');
const { pool } = require('./event_db');

const port = Number(process.env.PORT || 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be a number between 1 and 65535.');
}

async function start() {
  // Fail at startup with a clear message rather than serving a broken page.
  await pool.query('SELECT 1');
  makeApp().listen(port, () => {
    console.log(`Kindred Events running at http://localhost:${port}`);
  });
}

start().catch(error => {
  console.error('Unable to connect to MySQL. Check DB_HOST, DB_USER, DB_PASSWORD and imported schema.', error);
  process.exitCode = 1;
  pool.end();
});
