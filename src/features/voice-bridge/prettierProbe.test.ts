// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { format } from 'prettier';

const files = ['reservationDraftVoiceAdapter.ts', 'reservationDraftVoiceAdapter.test.ts'] as const;

describe('V6-B Prettier probe', () => {
  it('prints exact repository formatting for the V6-B files', async () => {
    for (const file of files) {
      const source = readFileSync(new URL(`./${file}`, import.meta.url), 'utf8').replaceAll(
        '// prettier-ignore\n',
        '',
      );
      const formatted = await format(source, {
        parser: 'typescript',
        printWidth: 100,
        singleQuote: true,
        trailingComma: 'all',
      });

      process.stdout.write(`V6B_PRETTIER_BEGIN:${file}\n${formatted}V6B_PRETTIER_END:${file}\n`);
      expect(formatted.length).toBeGreaterThan(0);
    }
  });
});
