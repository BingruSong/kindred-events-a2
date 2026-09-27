'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { parseFilters, positiveId, brisbaneDayBounds } = require('../filters');

test('combines independent filters with bound values', () => {
  const result = parseFilters({ upcoming: '1', date: '2026-10-10', location: 'Bris%_', category: '3' });
  assert.match(result.where, /e\.status = 'active'/);
  assert.match(result.where, /e\.ends_at >= UTC_TIMESTAMP\(\)/);
  assert.match(result.where, /e\.starts_at < \? AND e\.ends_at > \?/);
  assert.deepEqual(result.params, ['2026-10-10 14:00:00', '2026-10-09 14:00:00', '%Bris!%!_%', '%Bris!%!_%', 3]);
});

test('Brisbane day bounds are UTC+10 across year boundaries', () => {
  assert.deepEqual(brisbaneDayBounds('2027-01-01'), ['2026-12-31 14:00:00', '2027-01-01 14:00:00']);
});

test('rejects impossible dates, duplicate values and malformed ids', () => {
  assert.throws(() => brisbaneDayBounds('2026-02-30'), /real calendar day/);
  assert.throws(() => parseFilters({ location: ['Brisbane', 'Cairns'] }), /supplied once/);
  assert.throws(() => parseFilters({ category: '1 OR 1=1' }), /positive integer/);
  assert.throws(() => parseFilters({ date: '2026-10-01', surprise: 'x' }), /Unknown filter/);
  assert.throws(() => positiveId('0', 'id'), /positive integer/);
  assert.throws(() => positiveId('2147483648', 'id'), /out of range/);
});
