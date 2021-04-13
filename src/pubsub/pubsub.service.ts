import { Topic, Subscription, PubSub } from '@google-cloud/pubsub';
import { Injectable } from '@nestjs/common';
import { PubSubSettings, SubscriptionSettings, TopicSettings } from './pubsub.module';
import { Token } from './utils/token';

@Injectable()
export class PubSubService {
  private subscriptions: Record<Token, FullSubscriptionSettings>;

  constructor(public readonly pubSub: PubSub, private settings: PubSubSettings) {
    this.subscriptions = createSubscriptionsStore(settings.topics);
  }

  getTopic(token: Token): Topic {
    const topic = this.settings.topics[token as string];
    if (!topic) {
      throw new Error(`Cannot find topic by alias: ${String(token)}`);
    }

    const { name, options } = topic;
    return this.pubSub.topic(name, options);
  }

  getSubscription(token: Token): Subscription {
    const subscription = this.subscriptions[token as string];
    if (!subscription) {
      throw new Error(`Cannot find subscription by alias: ${String(token)}`);
    }

    const { topic, name, options } = subscription;
    return this.pubSub.topic(topic).subscription(name, options);
  }
}

export type FullSubscriptionSettings = SubscriptionSettings & { topic: string };

export function createSubscriptionsStore(
  topics: Record<Token, TopicSettings>
): Record<Token, FullSubscriptionSettings> {
  return Object.fromEntries(
    Object.entries(topics)
      .map(([topic, topicSettings]) =>
        Object.entries(
          topicSettings.subscriptions ?? {}
        ).map(([subscription, subscriptionSettings]) => [
          subscription,
          { topic, ...subscriptionSettings },
        ])
      )
      .flat()
  );
}
