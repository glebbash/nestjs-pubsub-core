import { PublishOptions } from '@google-cloud/pubsub';
import { PubSubPublisherSettings } from '../pubsub-publisher/pubsub-publisher.module';

export type DefaultRetryOptions = Record<string, unknown>;

export const defaultRetryOptions = (
  settings: Partial<PubSubPublisherSettings>
): PublishOptions => ({
  gaxOpts: {
    retry: {
      backoffSettings: {
        initialRetryDelayMillis: 1,
        retryDelayMultiplier: 1.3,
        maxRetryDelayMillis: 60000,
        initialRpcTimeoutMillis: 5000,
        rpcTimeoutMultiplier: 1.0,
        maxRpcTimeoutMillis: 600000,
        totalTimeoutMillis: settings.requestTimeoutMillis ?? 600000,
      },
    },
  },
});
