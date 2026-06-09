// Headless test runner: loads the game and reports any console errors
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'http://127.0.0.1:8765/';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--mute-audio'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 320, height: 480, deviceScaleFactor: 2 });

  const logs = [];
  const errors = [];
  page.on('console', (msg) => logs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}\n${err.stack}`));
  page.on('requestfailed', (req) => errors.push(`requestfailed: ${req.url()} - ${req.failure() && req.failure().errorText}`));

  await page.goto(URL, { waitUntil: 'networkidle0', timeout: 15000 });

  // Wait a bit for the loop to tick
  await new Promise((r) => setTimeout(r, 1500));

  // Click start to actually begin the game
  await page.click('#start');
  await new Promise((r) => setTimeout(r, 1500));

  // Take a screenshot of the play state
  await page.screenshot({ path: path.join(__dirname, 'shot-play.png') });

  // Simulate a few inputs: move right, fire
  await page.keyboard.down('ArrowRight');
  await new Promise((r) => setTimeout(r, 200));
  await page.keyboard.down(' ');
  await new Promise((r) => setTimeout(r, 600));
  await page.keyboard.up(' ');
  await page.keyboard.up('ArrowRight');

  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(__dirname, 'shot-play2.png') });

  // Inspect game state from inside the page
  const state = await page.evaluate(() => {
    const c = document.getElementById('game');
    return {
      canvasW: c.width,
      canvasH: c.height,
      hasOverlayHidden: document.getElementById('overlay').classList.contains('hidden'),
    };
  });

  console.log('=== STATE ===');
  console.log(JSON.stringify(state, null, 2));
  console.log('=== CONSOLE LOGS ===');
  logs.forEach((l) => console.log(l));
  console.log('=== ERRORS ===');
  if (errors.length === 0) console.log('(none)');
  else errors.forEach((e) => console.log(e));

  await browser.close();
})().catch((e) => {
  console.error('FATAL', e);
  process.exit(1);
});
