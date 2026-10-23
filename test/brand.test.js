import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const site = path => new URL(`_site/${path}`, root);
const html = path => readFileSync(site(path), 'utf8');

test('published pages present Pixelart as the product and Shenmali as the repository', () => {
  for (const path of ['index.html', 'editor/index.html', 'docs/index.html']) {
    const page = html(path);
    assert.match(page, /<title>[^<]*Pixelart[^<]*<\/title>/, path);
    assert.match(page, /https:\/\/github\.com\/shenmali\/g-pixelart/, path);
    assert.doesNotMatch(page, /Tezumie|Image-to-Pixel/, path);
  }
  assert.match(html('index.html'), /image/i);
  assert.ok(!existsSync(site('classic/index.html')));
});

test('the published site includes the original MIT notice', () => {
  const notice = readFileSync(site('LICENSE'), 'utf8');
  assert.match(notice, /Copyright \(c\) 2023-2026 Tezumie/);
  assert.match(notice, /The above copyright notice and this permission notice/);
  assert.match(readFileSync(site('licenses/shadermate.txt'), 'utf8'), /Copyright \(c\) 2025-2026 Tezumie/);
  assert.match(readFileSync(site('assets/fonts/jetbrains-mono-LICENSE.txt'), 'utf8'), /SIL OPEN FONT LICENSE/i);
});
