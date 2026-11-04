#!/usr/bin/env node
/**
 * Asserts every public route renders its own head tags.
 *
 * Next.js silently drops `metadata` when a route file cannot export it (for
 * example, when the file starts with 'use client'), so those routes inherit the
 * root layout title and description and look fine in a browser while being
 * wrong for search engines.
 *
 * Usage: node scripts/check-metadata.mjs [baseUrl]
 * Default baseUrl: http://localhost:3000
 */
const base = process.argv[2] || process.env.BASE_URL || 'http://localhost:3000';
const routes = ['/', '/about', '/calendar', '/contact'];

const pick = (html, re) => {
  const m = html.match(re);
  return m ? m[1].trim() : null;
};

const problems = [];
const head = new Map();

for (const route of routes) {
  const res = await fetch(base + route, { redirect: 'follow' });
  const html = await res.text();
  const label = `${route} (${res.status})`;

  if (!res.ok) {
    problems.push(`${label}: expected 200`);
    continue;
  }

  const title = pick(html, /<title>([^<]*)<\/title>/);
  const description = pick(html, /<meta name="description" content="([^"]*)"/);
  const viewport = pick(html, /<meta name="viewport" content="([^"]*)"/);

  if (!title) problems.push(`${label}: no <title>`);
  if (!description) problems.push(`${label}: no <meta name="description">`);
  if (!viewport) problems.push(`${label}: no <meta name="viewport">`);

  head.set(route, { title, description });
}

const root = head.get('/');

for (const [route, { title, description }] of head) {
  if (!root || route === '/') continue;
  if (title && title === root.title) {
    problems.push(`${route}: title is the site default "${title}" — route has no metadata export`);
  }
  if (description && description === root.description) {
    problems.push(`${route}: description is the site default — route has no metadata export`);
  }
}

if (problems.length) {
  console.error(`metadata check failed against ${base}`);
  for (const p of problems) console.error(`  x ${p}`);
  process.exit(1);
}

console.log(`metadata check passed against ${base}`);
for (const [route, { title }] of head) console.log(`  ok ${route} — ${title ?? '?'}`);
