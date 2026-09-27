'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { makeApp } = require('../app');

const sample = {
  id: 1, name: 'Riverbank Planting Day',
  starts_at: new Date('2026-10-10T00:00:00.000Z'),
  ends_at: new Date('2026-10-10T04:00:00.000Z'),
  venue: 'Marlow River Reserve', city: 'Brisbane',
  purpose: 'Restore habitat', description: 'A fictional event',
  ticket_price: 0, fundraising_goal: 5000, amount_raised: 1860,
  status: 'active', image_path: '/assets/riverbank-planting.svg',
  category_id: 1, category_name: 'Environment', category_description: 'Restoration',
};

async function withServer(db, run) {
  const server = makeApp({ db }).listen(0);
  await new Promise(resolve => server.once('listening', resolve));
  try {
    await run(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
}

test('list returns mapped event fields and SQL-bound filters', async () => {
  const calls = [];
  await withServer(async (sql, params) => { calls.push({ sql, params }); return [sample]; }, async base => {
    const response = await fetch(`${base}/api/events?upcoming=1&category=1`);
    assert.equal(response.status, 200);
    const events = await response.json();
    assert.equal(events[0].startsAt, '2026-10-10T00:00:00.000Z');
    assert.deepEqual(events[0].category, { id: 1, name: 'Environment', description: 'Restoration' });
    assert.equal(events[0].image, '/assets/riverbank-planting.svg');
  });
  assert.match(calls[0].sql, /e\.status = 'active'/);
  assert.match(calls[0].sql, /e\.ends_at >= UTC_TIMESTAMP\(\)/);
  assert.deepEqual(calls[0].params, [1]);
});

test('invalid filters, absent events and database errors have stable envelopes', async () => {
  await withServer(async () => [], async base => {
    const bad = await fetch(`${base}/api/events?category=no`);
    assert.equal(bad.status, 400);
    assert.equal((await bad.json()).error.code, 'INVALID_QUERY');
    const missing = await fetch(`${base}/api/events/999`);
    assert.equal(missing.status, 404);
    assert.equal((await missing.json()).error.code, 'NOT_FOUND');
  });
  const original = console.error;
  console.error = () => {};
  try {
    await withServer(async () => { throw new Error('sensitive database detail'); }, async base => {
      const response = await fetch(`${base}/api/categories`);
      assert.equal(response.status, 500);
      assert.equal((await response.json()).error.message, 'Unable to complete the request.');
    });
  } finally {
    console.error = original;
  }
});
