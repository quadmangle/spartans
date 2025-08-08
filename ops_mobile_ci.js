const fs = require('node:fs');
const path = require('node:path');

// Pages used in mobile CI checks. Ensure each page includes
// the FAB loader script so modal tests can run properly.
const pages = [
  '/index.html',
  '/contact-center.html',
  '/it-support.html',
  '/professional-services.html',
  '/fabs/join.html'
];

const root = __dirname;

for (const page of pages) {
  const filePath = path.join(root, page);
  const html = fs.readFileSync(filePath, 'utf8');
  // Modal fragments under /fabs/ don't include FAB buttons directly.
  if (!page.startsWith('/fabs/')) {
    if (!html.includes('cojoinlistener.js')) {
      throw new Error(`FAB buttons missing on ${page}`);
    }
  }
}

module.exports = pages;
