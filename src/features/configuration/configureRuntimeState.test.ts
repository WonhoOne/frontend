import { describe, expect, it } from 'vitest';

import {
  configurationGroupBlocksReview,
  configurationGroupRetainsData,
  createReadyConfigureRuntimeState,
  type ConfigurationGroupRuntimeState,
} from '@/features/configuration';

describe('Configure runtime state', () => {
  it('starts every group ready without inventing network state', () => {
    expect(createReadyConfigureRuntimeState()).toEqual({
      connectivity: 'online',
      groups: {
        hotel: { status: 'ready' },
        transport: { status: 'ready' },
        meal: { status: 'ready' },
        extras: { status: 'ready' },
      },
    });
  });

  it('retains successful content while refreshing, stale, or explicitly invalid', () => {
    const retained: ConfigurationGroupRuntimeState[] = [
      { status: 'ready' },
      { status: 'refreshing' },
      { status: 'stale' },
      { status: 'invalid' },
    ];

    expect(retained.every(configurationGroupRetainsData)).toBe(true);
    expect(configurationGroupRetainsData({ status: 'loading' })).toBe(false);
    expect(configurationGroupRetainsData({ status: 'error', isRetrying: false })).toBe(false);
    expect(configurationGroupRetainsData({ status: 'empty' })).toBe(false);
  });

  it('blocks required groups only for states with no usable data or a known invalid selection', () => {
    expect(configurationGroupBlocksReview({ status: 'loading' }, true)).toBe(true);
    expect(configurationGroupBlocksReview({ status: 'error', isRetrying: false }, true)).toBe(true);
    expect(configurationGroupBlocksReview({ status: 'empty' }, true)).toBe(true);
    expect(configurationGroupBlocksReview({ status: 'invalid' }, true)).toBe(true);

    expect(configurationGroupBlocksReview({ status: 'refreshing' }, true)).toBe(false);
    expect(configurationGroupBlocksReview({ status: 'stale' }, true)).toBe(false);
    expect(configurationGroupBlocksReview({ status: 'invalid' }, false)).toBe(false);
  });
});
