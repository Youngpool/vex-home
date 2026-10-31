const { chromium } = require('playwright'); const fs = require('fs');
(async () => { const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('file://' + require('path').resolve(__dirname, 'render.html') + ''); await p.waitForFunction(() => document.title.startsWith('done'), null, { timeout: 240000 });
  console.log(await p.title()); fs.writeFileSync('' + require('path').resolve(__dirname, '../vex-night-drive.raw.wav') + '', Buffer.from(await p.evaluate(() => window.WAV), 'base64')); await b.close(); })();
