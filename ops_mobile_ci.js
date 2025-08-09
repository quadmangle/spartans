const fs = require('node:fs');
const path = require('node:path');
const httpServer = require('http-server');
const { chromium } = require('playwright');

// Pages used in mobile CI checks. Ensure each page includes
// the FAB loader script so modal tests can run properly.
const pages = [
  '/index.html',
  '/contact-center.html',
  '/it-support.html',
  '/professional-services.html',
  '/fabs/join.html'
];

async function run() {
  const root = __dirname;
  const port = 8080;
  const server = httpServer.createServer({ root });
  await new Promise(resolve => server.listen(port, resolve));

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 375, height: 667 } });
  const axeSource = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

  let hasViolations = false;

  for (const route of pages) {
    const filePath = path.join(root, route);
    // Modal fragments under /fabs/ don't include FAB buttons directly.
    if (!route.startsWith('/fabs/')) {
      const html = fs.readFileSync(filePath, 'utf8');
      if (!html.includes('cojoinlistener.js')) {
        throw new Error(`FAB buttons missing on ${route}`);
      }
    }

    const url = `http://localhost:${port}${route}`;
    await page.goto(url);
    await page.addScriptTag({ content: axeSource });
    const results = await page.evaluate(async () => {
      return await axe.run();
    });

    if (results.violations.length > 0) {
      console.error(`Accessibility issues on ${route}:`);
      for (const v of results.violations) {
        console.error(`- ${v.id}: ${v.description}`);
      }
      hasViolations = true;
    } else {
      console.log(`${route}: no accessibility violations`);
    }
  }

  await browser.close();
  await new Promise(resolve => server.close(resolve));

  if (hasViolations) {
    process.exit(1);
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
