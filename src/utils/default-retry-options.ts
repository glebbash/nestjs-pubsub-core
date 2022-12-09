export type DefaultRetryOptions = Record<string, unknown>;

export const defaultRetryOptions = (timeoutMillis: number): DefaultRetryOptions => ({
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
