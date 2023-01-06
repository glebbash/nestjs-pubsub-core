import { PubSubPublisherSettings } from '../pubsub-publisher/pubsub-publisher.module';

export type DefaultRetryOptions = Record<string, unknown>;

export const defaultRetryOptions = (
  settings: Partial<PubSubPublisherSettings>
): DefaultRetryOptions => ({
  gaxOpts: {
    retry: {
      backoffSettings: {
        initialRetryDelayMillis: 1,
        retryDelayMultiplier: 1.3,
        maxRetryDelayMillis: 100,
        totalTimeoutMillis: settings.requestTimeoutMillis ?? 100,
      },
    },
  },
});
