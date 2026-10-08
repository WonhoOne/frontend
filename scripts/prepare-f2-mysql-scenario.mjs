import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Disposable CI database only. No credentials, SMS recipient, or personal data in manifest.
const dateAfter = (days) => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};
const manifest = {
  schemaVersion: 1,
  products: [{
    key: 'f2-golf',
    theme: 'GOLF_CHALLENGE',
    name: 'F2 Synthetic Golf',
    description: 'Automated disposable integration-only tour.',
    stylePrices: [
      { style: 'CLASSIC', amount: 250000, currency: 'KRW' },
      { style: 'GRAND', amount: 400000, currency: 'KRW' },
      { style: 'PREMIUM', amount: 650000, currency: 'KRW' },
    ],
  }],
  schedules: [{
    productKey: 'f2-golf',
    startDate: dateAfter(35),
    endDate: dateAfter(40),
  }],
};
const directory = resolve('.f2-backend/target');
await mkdir(directory, { recursive: true });
await writeFile(resolve(directory, 'f2-mysql-scenario.json'), JSON.stringify(manifest));
console.log('Prepared one disposable F2 tour and one future schedule for MySQL integration.');
