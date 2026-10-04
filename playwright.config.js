// Playwright config for the Moishes static site. Chromium comes from PLAYWRIGHT_BROWSERS_PATH (/opt/pw-browsers);
// never run `playwright install`.
const { defineConfig } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

function findChromium() {
  if (process.env.PW_CHROMIUM_PATH) return process.env.PW_CHROMIUM_PATH;
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
  try {
    for (const d of fs.readdirSync(root).filter((n) => /^chromium-\d+$/.test(n)).sort().reverse()) {
      const p = path.join(root, d, 'chrome-linux', 'chrome');
      if (fs.existsSync(p)) return p;
    }
  } catch (e) { /* fall through to playwright default */ }
  return undefined;
}

const PORT = 8123;
module.exports = defineConfig({
  testDir: 'tests/e2e',
  timeout: 45000,
  expect: { timeout: 7000 },
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    launchOptions: { executablePath: findChromium(), args: ['--no-sandbox'] },
    serviceWorkers: 'block',
    trace: 'off',
  },
  projects: [
    { name: 'mobile', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } },
    { name: 'desktop', use: { viewport: { width: 1280, height: 800 } } },
  ],
  webServer: {
    command: `python3 -m http.server ${PORT} --bind 127.0.0.1`,
    url: `http://127.0.0.1:${PORT}/index.html`,
    reuseExistingServer: true,
    timeout: 20000,
  },
});
