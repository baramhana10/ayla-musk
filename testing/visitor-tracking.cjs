// Local API regression checks with in-memory fixtures; no production DB writes.
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'visitor-tests-only';
const visitors = new Map();
let simulateRace = false;
const { Prisma } = require('../backend/node_modules/@prisma/client');
const mock = {
  siteVisitor: {
    upsert: async ({ where, create, update }) => {
      if (simulateRace) {
        simulateRace = false;
        visitors.set(where.id, create);
        throw new Prisma.PrismaClientKnownRequestError('Concurrent insert', { code: 'P2002', clientVersion: '6.19.0' });
      }
      visitors.set(where.id, visitors.has(where.id) ? { ...visitors.get(where.id), ...update } : create);
    },
    update: async ({ where, data }) => visitors.set(where.id, { ...visitors.get(where.id), ...data }),
    count: async (query) => [...visitors.values()].filter(v => !query || v.lastSeen >= query.where.lastSeen.gte).length,
  },
  order: { findMany: async () => [] },
  product: { findMany: async () => [] },
};
const prismaPath = require.resolve('../backend/dist/lib/prisma');
require.cache[prismaPath] = { id: prismaPath, filename: prismaPath, loaded: true, exports: { prisma: mock } };
const app = require('../backend/dist/app').default;
const { signToken } = require('../backend/dist/lib/jwt');
const cookie = `ayla_token=${signToken({ userId: 'test-admin', role: 'ADMIN' })}`;
const server = app.listen(0, '127.0.0.1', async () => {
  const base = `http://127.0.0.1:${server.address().port}`;
  const visit = (visitorId, admin = false) => fetch(`${base}/api/analytics/visit`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...(admin ? { cookie } : {}) }, body: JSON.stringify({ visitorId }),
  });
  try {
    const id = randomUUID();
    assert.equal((await visit(id)).status, 204);
    await Promise.all([visit(id), visit(id), visit(id)]);
    assert.equal(visitors.size, 1, 'reloads and concurrent tabs count once');
    assert.equal((await visit('invalid')).status, 400);
    assert.equal((await visit(randomUUID(), true)).status, 204);
    assert.equal(visitors.size, 1, 'signed-in admins are excluded');
    simulateRace = true;
    assert.equal((await visit(randomUUID())).status, 204, 'concurrent first visit is recovered');
    const oldId = randomUUID();
    visitors.set(oldId, { id: oldId, lastSeen: new Date(Date.now() - 8 * 86400000) });
    visitors.set(randomUUID(), { lastSeen: new Date(Date.now() - 2 * 86400000) });
    assert.equal((await fetch(`${base}/api/admin/stats`)).status, 401);
    const stats = await (await fetch(`${base}/api/admin/stats`, { headers: { cookie } })).json();
    assert.equal(stats.visitorCount, 4);
    assert.equal(stats.visitors24Hours, 2);
    assert.equal(stats.visitors7Days, 3);
    await visit(oldId);
    const refreshed = await (await fetch(`${base}/api/admin/stats`, { headers: { cookie } })).json();
    assert.equal(refreshed.visitorCount, 4, 'returning visitors do not inflate all-time total');
    assert.equal(refreshed.visitors24Hours, 3);
    assert.equal(refreshed.visitors7Days, 4);
    console.log('PASS: deduplication, validation, admin exclusion, insert race, protected stats, rolling periods, returning visitors');
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    server.close();
  }
});
