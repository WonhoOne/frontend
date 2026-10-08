import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { URL } from 'node:url';

const distRoot = new URL('../dist/', import.meta.url);
const pagesRoot = new URL('../src/pages/', import.meta.url);

// Production bundle must not retain these test/DEV-only data sentinels.
const forbidden = [
  '__F1_PUBLIC_READ_MOCK_ONLY__',
  'Schedule preview A · Dates supplied by approved schedule data',
  'Mock 제주 허니문',
];

async function filesUnder(directoryUrl) {
  const entries = await readdir(directoryUrl, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const childUrl = new URL(entry.name + (entry.isDirectory() ? '/' : ''), directoryUrl);
    if (entry.isDirectory()) {
      files.push(...(await filesUnder(childUrl)));
    } else {
      files.push(childUrl);
    }
  }

  return files;
}

// No production page may bypass its composition boundary by importing a Mock source.
for (const fileUrl of await filesUnder(pagesRoot)) {
  if (!/\.(tsx?|jsx?)$/.test(fileUrl.pathname) || /\.test\.[jt]sx?$/.test(fileUrl.pathname)) {
    continue;
  }

  const content = await readFile(fileUrl, 'utf8');
  const imports = content.match(/import[\s\S]*?from\s*['"][^'"]+['"];?/g) ?? [];
  if (imports.some((statement) => /\bmock[A-Z]|\bMock[A-Z]|\/mocks\b/.test(statement))) {
    throw new Error(`Production page imports Mock runtime directly: ${fileUrl.pathname}`);
  }
}

for (const fileUrl of await filesUnder(distRoot)) {
  if (fileUrl.pathname.endsWith('/mockServiceWorker.js')) {
    throw new Error('Production build must never publish the development Mock Service Worker.');
  }

  const content = await readFile(fileUrl, 'utf8').catch(() => '');
  for (const marker of forbidden) {
    if (content.includes(marker)) {
      throw new Error(
        `Production bundle contains DEV/mock-only marker "${marker}" in ${join('dist', fileUrl.pathname.split('/dist/')[1] ?? '')}.`,
      );
    }
  }
}
