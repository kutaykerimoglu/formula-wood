// Smoke checks run in CI on every pull request. Run `npm run check` locally.
// Pass --update to accept intentional physics changes into the lap-time snapshot.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {blank, lap, names, valid} from '../physics.mjs';

const snapshotFile = new URL('./stock-laps.json', import.meta.url);

// 1. Physics: every circuit produces a sane stock lap.
assert.ok(valid(blank()), 'blank() setup must pass valid()');
const laps = Object.fromEntries(names.map((name, track) => {
 const {total} = lap(blank(), track);
 assert.ok(Number.isFinite(total) && total > 0, `${name}: stock lap must be a positive number, got ${total}`);
 return [name, Number(total.toFixed(6))];
}));

// 2. Lap times feed the leaderboard, so any change to them must be deliberate.
if (process.argv.includes('--update') || !fs.existsSync(snapshotFile)) {
 fs.writeFileSync(snapshotFile, JSON.stringify(laps, null, 1) + '\n');
 console.log('Wrote stock lap snapshot.');
} else {
 const expected = JSON.parse(fs.readFileSync(snapshotFile, 'utf8'));
 assert.deepEqual(laps, expected, 'Stock lap times changed. This invalidates stored leaderboard times. ' +
  'If intended, run `node scripts/check.mjs --update` and plan a leaderboard reset.');
}

// 3. The built Worker answers the routes the page depends on.
const {default: worker} = await import('../dist/server/index.js');
const writes = [];
const DB = {prepare: sql => ({bind: (...args) => ({
 all: async () => ({results: []}),
 run: async () => { writes.push({sql, args}); return {}; },
})})};
const call = (path, init) => worker.fetch(new Request('https://fw.test' + path, init), {DB});

let res = await call('/');
assert.equal(res.status, 200);
assert.match(await res.text(), /Formula Wood/);
assert.equal((await call('/api/v3/scores/0')).status, 200);
assert.equal((await call('/api/v3/scores/999')).status, 404);
assert.equal((await call('/nope')).status, 404);

res = await call('/api/v3/scores/0', {method: 'POST', headers: {origin: 'https://evil.test'}, body: '{}'});
assert.equal(res.status, 403, 'cross-origin submissions must be rejected');

res = await call('/api/v3/scores/0', {method: 'POST', headers: {origin: 'https://fw.test'},
 body: JSON.stringify({s: blank(), name: 'CI'})});
assert.equal(res.status, 200);
const body = await res.json();
assert.equal(body.time, lap(blank(), 0).total, 'server must time the lap itself');
assert.equal(writes.length, 1);

console.log(`OK · ${names.length} circuits · worker routes respond`);
