// Local development: rebuild the page whenever a source file changes and run the
// Worker with a local D1 database at http://localhost:8787.
import {execFileSync, spawn} from 'node:child_process';
import fs from 'node:fs';

const sources = ['physics.mjs', 'renderer.js', 'app.js', 'index.html', 'api.mjs', 'build.mjs'];
const build = () => {
 try { execFileSync(process.execPath, ['build.mjs'], {stdio: 'inherit'}); console.log('[dev] rebuilt'); }
 catch { console.error('[dev] build failed; fix the error and save again'); }
};

build();
execFileSync('npx', ['wrangler', 'd1', 'migrations', 'apply', 'DB', '--local'], {stdio: 'inherit'});

let timer;
for (const file of sources) fs.watch(file, () => { clearTimeout(timer); timer = setTimeout(build, 80); });

// wrangler reloads the Worker whenever the rebuilt dist/server/index.js changes.
const worker = spawn('npx', ['wrangler', 'dev'], {stdio: 'inherit'});
worker.on('exit', code => process.exit(code ?? 0));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => worker.kill(signal));
