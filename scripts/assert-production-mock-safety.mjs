import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { URL } from 'node:url';

const distRoot = new URL('../dist/', import.meta.url);
const forbidden = [
  '__F1_PUBLIC_READ_MOCK_ONLY__',
  'Schedule preview A · Dates supplied by approved schedule data',
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

const files = await filesUnder(distRoot);

for (const fileUrl of files) {
  const content = await readFile(fileUrl, 'utf8').catch(() => '');
  for (const marker of forbidden) {
    if (content.includes(marker)) {
      throw new Error(
        `Production bundle contains DEV/mock-only marker "${marker}" in ${join('dist', fileUrl.pathname.split('/dist/')[1] ?? '')}.`,
      );
    }
  }
}
