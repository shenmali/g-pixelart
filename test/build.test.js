// Checks the published bundles: they exist, load as ESM, CJS and a script global, and agree with the source.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const dist = f => new URL(`dist/${f}`, root);
const pkg = JSON.parse(readFileSync(new URL('package.json', root), 'utf8'));

test('package metadata points to local builds and keeps the MIT license', () => {
  assert.equal(pkg.private, true);
  assert.equal(pkg.license, 'MIT');
  assert.ok(existsSync(new URL('LICENSE', root)));
  assert.match(readFileSync(new URL('LICENSE', root), 'utf8'), /MIT License/);
  for (const k of ['main', 'module', 'types', 'unpkg']) assert.ok(existsSync(new URL(pkg[k], root)), `${k}: ${pkg[k]}`);
  for (const [k, v] of Object.entries(pkg.exports)) {
    if (typeof v === 'string') { if (!v.includes('*')) assert.ok(existsSync(new URL(v, root)), `${k}`); continue; }
    for (const f of Object.values(v)) assert.ok(existsSync(new URL(f, root)), `${k}: ${f}`);
  }
  assert.equal(pkg.scripts.test, 'npm run build:site && node --test', 'node --test without arguments');
});

test('every bundle was built', () => {
  for (const f of ['g-pixelart.esm.js', 'g-pixelart.cjs', 'g-pixelart.js', 'g-pixelart.min.js', 'g-pixelart.bundle.esm.js', 'video.esm.js', 'editor.esm.js', 'editor.css'])
    assert.ok(existsSync(dist(f)), f);
  assert.ok(readFileSync(dist('g-pixelart.min.js'), 'utf8').startsWith(`/*! g-pixelart v${pkg.version} | MIT`));
});

test('ESM build matches the source API', async () => {
  const src = await import('../lib/index.js');
  const built = await import(dist('g-pixelart.esm.js').href);
  assert.deepEqual(Object.keys(built).sort(), Object.keys(src).sort());
  const px = await built.createPixelator();
  const data = new Uint8ClampedArray(16 * 16 * 4).fill(200);
  const r = await px.process({ width: 16, height: 16, data }, { size: { width: 4 } });
  assert.equal(r.width, 4);
});

test('CJS build loads with require()', () => {
  const require = createRequire(import.meta.url);
  const m = require('../dist/g-pixelart.cjs');
  assert.equal(typeof m.createPixelator, 'function');
  assert.equal(m.PALETTES.length, 24);
});

test('script build defines the Pixelart global', () => {
  for (const f of ['g-pixelart.js', 'g-pixelart.min.js']) {
    const ctx = { console, TextEncoder, TextDecoder, Uint8Array, atob, btoa };
    ctx.window = ctx; ctx.self = ctx; ctx.globalThis = ctx;
    vm.createContext(ctx);
    vm.runInContext(readFileSync(dist(f), 'utf8'), ctx);
    assert.equal(typeof ctx.Pixelart.createPixelator, 'function', f);
    assert.equal(typeof ctx.Pixelart.pixelate, 'function', f);
    assert.equal(ctx.Pixelart.VERSION, pkg.version);
  }
});

test('types cover every runtime export', () => {
  const dts = readFileSync(new URL('types/index.d.ts', root), 'utf8');
  return import('../lib/index.js').then(m => {
    for (const name of Object.keys(m)) assert.match(dts, new RegExp(`export (declare )?(function|const|type|interface) ${name}\\b`), name);
  });
});
