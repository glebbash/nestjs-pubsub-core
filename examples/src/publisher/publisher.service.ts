import { Message, Subscription, Topic } from '@google-cloud/pubsub';
import { Injectable } from '@nestjs/common';
import { InjectSubscription, InjectTopic } from '../../../src/nestjs-pubsub-core';
import { MainSubscription, MainTopic } from './publisher.constants';

@Injectable()
export class PublisherService {
  constructor(
    @InjectTopic(MainTopic) private topic: Topic,
    @InjectSubscription(MainSubscription) private subscription: Subscription
  ) {}

  subscribe(handle: (message: Message) => void): void {
    this.subscription.on('message', handle);
  }

  async sendMessage(message: string): Promise<void> {
    await this.topic.publishMessage({
      json: message,
    });
  }
}
