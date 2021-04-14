import { Message, Subscription, Topic } from '@google-cloud/pubsub';
import { Injectable } from '@nestjs/common';
import {
  InjectSubscription,
  InjectTopic,
  PubSubPublisherService,
} from '../../../src/nestjs-pubsub-core';
import { MainSubscription, MainTopic } from './publisher.constants';

@Injectable()
export class PublisherService {
  constructor(
    @InjectTopic(MainTopic) private topic: Topic,
    @InjectSubscription(MainSubscription) private subscription: Subscription,
    private publisher: PubSubPublisherService
  ) {}

  subscribe(handle: (message: Message) => void): void {
    this.subscription.on('message', handle);
  }

  async sendMessage(message: Record<string, unknown>): Promise<void> {
    await this.publisher.publish(MainTopic, message, {});
    // or
    await this.publisher.publishToTopic(this.topic, message, {});
  }
}
