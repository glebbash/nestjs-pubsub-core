import { defaultRetryOptions } from './default-retry-options';

describe('get default retry options', () => {
  it('returns default retry options with passed timeout in milliseconds', () => {
    const timeoutMillis = 100;
    expect(defaultRetryOptions(timeoutMillis)).toEqual({
      gaxOpts: {
        retry: {
          backoffSettings: {
            initialRetryDelayMillis: 1,
            retryDelayMultiplier: 1.3,
            maxRetryDelayMillis: 100,
            totalTimeoutMillis: timeoutMillis,
          },
        },
      },
    });
  });
});
