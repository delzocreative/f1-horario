// Builds the deployable site into public/ (Pages has no build command, so
// the output is committed). Run with: npm run build
//  - compiles src/tailwind.css -> public/assets/styles.<hash>.css (minified)
//  - copies src/app.js -> public/assets/app.<hash>.js
//  - writes public/index.html from src/index.html with the hashed names
//  - updates STATIC_ASSETS / CACHE_NAME in public/sw.js
// Hashed names let _headers cache /assets/* forever (immutable).
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs';

const hash = buf => createHash('sha256').update(buf).digest('hex').slice(0, 10);
mkdirSync('public/assets', { recursive: true });
for (const f of readdirSync('public/assets')) rmSync(`public/assets/${f}`);

execFileSync('npx', ['tailwindcss', '-c', 'tailwind.config.js', '-i', 'src/tailwind.css', '-o', '.tmp-styles.css', '--minify'], { stdio: 'inherit' });
const css = readFileSync('.tmp-styles.css'); rmSync('.tmp-styles.css');
const js = readFileSync('src/app.js');
const cssName = `styles.${hash(css)}.css`, jsName = `app.${hash(js)}.js`;
writeFileSync(`public/assets/${cssName}`, css);
writeFileSync(`public/assets/${jsName}`, js);

const html = readFileSync('src/index.html', 'utf8').replace('__CSS__', cssName).replace('__JS__', jsName);
writeFileSync('public/index.html', html);

let sw = readFileSync('public/sw.js', 'utf8');
const assets = ['/index.html', '/manifest.json', '/icon-192.png', '/icon-512.png', `/assets/${cssName}`, `/assets/${jsName}`, '/fonts/inter-latin-v20.woff2'];
sw = sw.replace(/const STATIC_ASSETS = \[[\s\S]*?\];/, `const STATIC_ASSETS = [\n${assets.map(a => `  '${a}'`).join(',\n')}\n];`);
sw = sw.replace(/const CACHE_NAME = '[^']*';/, `const CACHE_NAME = 'f1-dashboard-${hash(css + js + html)}';`);
writeFileSync('public/sw.js', sw);
console.log(`built ${cssName} (${css.length} B), ${jsName} (${js.length} B)`);
