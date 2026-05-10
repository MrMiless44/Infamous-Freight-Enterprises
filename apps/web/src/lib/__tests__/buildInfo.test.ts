import { describe, expect, it } from 'vitest';
import { BUILD_SHA, BUILD_TIME, getBuildInfo } from '../buildInfo';

describe('buildInfo', () => {
  it('exposes string constants for SHA and time', () => {
    expect(typeof BUILD_SHA).toBe('string');
    expect(typeof BUILD_TIME).toBe('string');
  });

  it('returns the same values from getBuildInfo()', () => {
    const info = getBuildInfo();
    expect(info.sha).toBe(BUILD_SHA);
    expect(info.time).toBe(BUILD_TIME);
  });
});
