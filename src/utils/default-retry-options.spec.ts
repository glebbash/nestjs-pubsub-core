import { defaultRetryOptions } from './default-retry-options';

describe('get default retry options', () => {
  it('returns default retry options with passed timeout in milliseconds', () => {
    const requestTimeoutMillis = 100;
    expect(defaultRetryOptions({ requestTimeoutMillis })).toEqual({
      gaxOpts: {
        retry: {
          backoffSettings: {
            initialRetryDelayMillis: 1,
            retryDelayMultiplier: 1.3,
            maxRetryDelayMillis: 60000,
            initialRpcTimeoutMillis: 5000,
            rpcTimeoutMultiplier: 1.0,
            maxRpcTimeoutMillis: 600000,
            totalTimeoutMillis: requestTimeoutMillis,
          },
        },
      },
    });
  });

  it('returns default retry options with passed timeout in milliseconds when requestTimeoutMillis is undefined', () => {
    const requestTimeoutMillis = undefined;
    expect(defaultRetryOptions({ requestTimeoutMillis })).toEqual({
      gaxOpts: {
        retry: {
          backoffSettings: {
            initialRetryDelayMillis: 1,
            retryDelayMultiplier: 1.3,
            maxRetryDelayMillis: 60000,
            initialRpcTimeoutMillis: 5000,
            rpcTimeoutMultiplier: 1.0,
            maxRpcTimeoutMillis: 600000,
            totalTimeoutMillis: 600000,
          },
        },
      },
    });
  });
});
