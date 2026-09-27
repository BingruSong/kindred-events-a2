'use strict';

const express = require('express');
const path = require('node:path');
const { query: databaseQuery } = require('./event_db');
const { InputError, parseFilters, positiveId } = require('./filters');

const EVENT_COLUMNS = `
  e.id, e.name, e.starts_at, e.ends_at, e.venue, e.city,
  e.purpose, e.description, e.ticket_price, e.fundraising_goal,
  e.amount_raised, e.status, e.image_path, c.id AS category_id,
  c.name AS category_name, c.description AS category_description
`;

function eventJson(row) {
  return {
    id: row.id,
    name: row.name,
    startsAt: new Date(row.starts_at).toISOString(),
    endsAt: new Date(row.ends_at).toISOString(),
    venue: row.venue,
    city: row.city,
    purpose: row.purpose,
    description: row.description,
    ticketPrice: Number(row.ticket_price),
    fundraisingGoal: Number(row.fundraising_goal),
    amountRaised: Number(row.amount_raised),
    status: row.status,
    category: {
      id: row.category_id,
      name: row.category_name,
      description: row.category_description,
    },
    image: row.image_path,
  };
}

function makeApp({ db = databaseQuery, staticDirectory = path.resolve(__dirname, '../clientside') } = {}) {
  const app = express();
  app.disable('x-powered-by');

  app.get('/api/categories', async (_req, res, next) => {
    try {
      const rows = await db('SELECT id, name, description FROM categories ORDER BY name');
      res.json(rows);
    } catch (error) { next(error); }
  });

  app.get('/api/events', async (req, res, next) => {
    try {
      const { where, params } = parseFilters(req.query);
      const rows = await db(`
        SELECT ${EVENT_COLUMNS}
        FROM events e JOIN categories c ON c.id = e.category_id
        WHERE ${where}
        ORDER BY e.starts_at, e.id
      `, params);
      res.json(rows.map(eventJson));
    } catch (error) { next(error); }
  });

  app.get('/api/events/:id', async (req, res, next) => {
    try {
      const id = positiveId(req.params.id, 'id');
      const rows = await db(`
        SELECT ${EVENT_COLUMNS}
        FROM events e JOIN categories c ON c.id = e.category_id
        WHERE e.id = ? AND e.status = 'active'
        LIMIT 1
      `, [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Event not found.' } });
      }
      return res.json(eventJson(rows[0]));
    } catch (error) { next(error); }
  });

  app.use('/api', (_req, res) => {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'API endpoint not found.' } });
  });

  app.use(express.static(staticDirectory, { extensions: ['html'] }));

  app.use((error, _req, res, _next) => {
    if (error instanceof InputError) {
      return res.status(400).json({ error: { code: error.code, message: error.message } });
    }
    console.error('API error:', error);
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Unable to complete the request.' } });
  });

  return app;
}

module.exports = { makeApp, eventJson };
