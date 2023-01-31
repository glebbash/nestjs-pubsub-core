import { Topic, Subscription, PubSub } from '@google-cloud/pubsub';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PubSubSettings, SubscriptionSettings, TopicSettings } from './pubsub.module';
import { Token } from '../utils/token';
import { PubSubPublisherSettings } from '../pubsub-publisher/pubsub-publisher.module';

@Injectable()
export class PubSubService implements OnModuleDestroy {
  private topicsSettings: Record<Token, TopicSettings>;
  private subscriptionsSettings: Record<Token, FullSubscriptionSettings>;

  private openTopics: Record<Token, Topic> = {};
  private openSubscriptions: Record<Token, Subscription> = {};

  constructor(public readonly pubSub: PubSub, private settings: PubSubSettings) {
    this.topicsSettings = settings.topics;
    this.subscriptionsSettings = createSubscriptionsStore(settings.topics);
  }

  /**
   * Setting `settings.requestTimeoutMillis` changes
   * `gaxOpts.retry.backoffSettings.maxRetryDelayMillis` value.
   *
   * **Note**: Topic options defined in `PubSubModule` will take precedence over the `settings`.
   */
  getTopic(token: Token, settings: Partial<PubSubPublisherSettings> = {}): Topic {
    return useCache(this.openTopics, token, (token) => {
      const topicSettings = this.topicsSettings[token as string];
      if (!topicSettings) {
        throw new Error(`Cannot find topic by alias: ${String(token)}`);
      }

      return this.pubSub.topic(topicSettings.name, {
        gaxOpts: {
          retry: {
            backoffSettings: {
              initialRetryDelayMillis: 100,
              retryDelayMultiplier: 1.3,
              maxRetryDelayMillis: settings.requestTimeoutMillis ?? 60000,
            },
          },
        },
        ...topicSettings.options,
      });
    });
  }

  getSubscription(token: Token): Subscription {
    return useCache(this.openSubscriptions, token, (token) => {
      const subscriptionSettings = this.subscriptionsSettings[token as string];
      if (!subscriptionSettings) {
        throw new Error(`Cannot find subscription by alias: ${String(token)}`);
      }

      const { topic, name, options } = subscriptionSettings;
      return this.getTopic(topic).subscription(name, options);
    });
  }

  getAllAccessedTopics(): Topic[] {
    return allValues(this.openTopics);
  }

  getAllAccessedSubscriptions(): Subscription[] {
    return allValues(this.openSubscriptions);
  }

  async onModuleDestroy(): Promise<void> {
    if (this.settings.closeOnModuleDestroy === false) {
      return;
    }

    await this.pubSub.close();
  }
}

type FullSubscriptionSettings = SubscriptionSettings & { topic: string };

function createSubscriptionsStore(
  topics: Record<Token, TopicSettings>
): Record<Token, FullSubscriptionSettings> {
  return Object.fromEntries(
    allEntries(topics)
      .map(([topic, topicSettings]) =>
        allEntries(topicSettings.subscriptions ?? {}).map(
          ([subscription, subscriptionSettings]) => [
            subscription,
            { topic, ...subscriptionSettings },
          ]
        )
      )
      .flat()
  );
}

/**
 * Returns all entries of the given object, including symbols.
 */
function allEntries<K extends string | symbol, V>(obj: Record<K, V>): [K, V][] {
  const stringKeys = Object.keys(obj) as K[];
  const symbolKeys = Object.getOwnPropertySymbols(obj) as K[];
  return [...stringKeys, ...symbolKeys].map((key) => [key, obj[key]]);
}

/**
 * Returns all values of the given object, including symbols.
 */
function allValues<K extends string | symbol, V>(obj: Record<K, V>): V[] {
  const stringKeys = Object.keys(obj) as K[];
  const symbolKeys = Object.getOwnPropertySymbols(obj) as K[];
  return [...stringKeys, ...symbolKeys].map((key) => obj[key]);
}

function useCache<K extends string | number | symbol, V>(
  cache: Record<K, V>,
  key: K,
  factory: (key: K) => V
): V {
  const cached = cache[key];
  if (cached) {
    return cached;
  }

  const created = factory(key);
  cache[key] = created;
  return created;
}
