'use strict';

class InputError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InputError';
    this.code = 'INVALID_QUERY';
  }
}

function oneValue(value, label) {
  if (Array.isArray(value) || typeof value !== 'string') {
    throw new InputError(`${label} must be supplied once.`);
  }
  return value;
}

function positiveId(value, label) {
  const raw = oneValue(value, label);
  if (!/^[1-9]\d{0,9}$/.test(raw)) {
    throw new InputError(`${label} must be a positive integer.`);
  }
  const id = Number(raw);
  if (!Number.isSafeInteger(id) || id > 2147483647) {
    throw new InputError(`${label} is out of range.`);
  }
  return id;
}

function brisbaneDayBounds(value) {
  const raw = oneValue(value, 'date');
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (!match) throw new InputError('date must use YYYY-MM-DD.');
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utcMidnight = Date.UTC(year, month - 1, day);
  const test = new Date(utcMidnight);
  if (test.getUTCFullYear() !== year || test.getUTCMonth() + 1 !== month || test.getUTCDate() !== day) {
    throw new InputError('date is not a real calendar day.');
  }
  // Queensland has UTC+10 year round. Use a half-open [start, end) day.
  const starts = new Date(utcMidnight - 10 * 60 * 60 * 1000);
  const ends = new Date(starts.getTime() + 24 * 60 * 60 * 1000);
  return [sqlUtc(starts), sqlUtc(ends)];
}

function sqlUtc(date) {
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

function escapeLike(value) {
  return value.replace(/[!%_]/g, character => `!${character}`);
}

function parseFilters(query) {
  const allowed = new Set(['upcoming', 'date', 'location', 'category']);
  for (const key of Object.keys(query)) {
    if (!allowed.has(key)) throw new InputError(`Unknown filter: ${key}.`);
  }

  const clauses = ["e.status = 'active'"];
  const params = [];

  if (query.upcoming !== undefined) {
    const flag = oneValue(query.upcoming, 'upcoming');
    if (flag !== '0' && flag !== '1') throw new InputError('upcoming must be 0 or 1.');
    if (flag === '1') clauses.push('e.ends_at >= UTC_TIMESTAMP()');
  }
  if (query.date !== undefined) {
    const [dayStart, nextDayStart] = brisbaneDayBounds(query.date);
    clauses.push('e.starts_at < ? AND e.ends_at > ?');
    params.push(nextDayStart, dayStart);
  }
  if (query.location !== undefined) {
    const location = oneValue(query.location, 'location').trim();
    if (!location || location.length > 100) {
      throw new InputError('location must contain 1 to 100 characters.');
    }
    const pattern = `%${escapeLike(location)}%`;
    clauses.push("(e.city LIKE ? ESCAPE '!' OR e.venue LIKE ? ESCAPE '!')");
    params.push(pattern, pattern);
  }
  if (query.category !== undefined) {
    clauses.push('e.category_id = ?');
    params.push(positiveId(query.category, 'category'));
  }

  return { where: clauses.join(' AND '), params };
}

module.exports = { InputError, parseFilters, positiveId, brisbaneDayBounds };
