import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(__dirname, '..');

describe('deploy config', () => {
  it('GitHub Pages workflow builds and deploys', () => {
    const p = resolve(root, '.github/workflows/deploy.yml');
    expect(existsSync(p)).toBe(true);
    const y = readFileSync(p, 'utf8');
    expect(y).toMatch(/npm ci/);
    expect(y).toMatch(/npm run build/);
    expect(y).toMatch(/actions\/upload-pages-artifact/);
    expect(y).toMatch(/actions\/deploy-pages/);
  });

  it('vite base path is configurable via env', () => {
    const v = readFileSync(resolve(root, 'vite.config.ts'), 'utf8');
    expect(v).toMatch(/base\s*:/);
    expect(v).toMatch(/BASE_PATH/);
  });

  it('index.html has a responsive viewport meta', () => {
    const h = readFileSync(resolve(root, 'index.html'), 'utf8');
    expect(h).toMatch(/name="viewport"[^>]*width=device-width/);
  });
});
