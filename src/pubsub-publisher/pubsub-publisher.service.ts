import { Topic } from '@google-cloud/pubsub';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Token } from '../utils/token';
import { PubSubService } from '../pubsub/pubsub.service';
import { PubSubPublisherSettings } from './pubsub-publisher.module';

@Injectable()
export class PubSubPublisherService {
  constructor(private pubSubService: PubSubService, private settings: PubSubPublisherSettings) {}

  async publish(
    token: Token,
    data: Record<string, unknown>,
    attributes: Record<string, string>
  ): Promise<string> {
    return this.publishToTopic(this.pubSubService.getTopic(token, this.settings), data, attributes);
  }

  async publishToTopic(
    topic: Topic,
    data: Record<string, unknown>,
    attributes: Record<string, string>
  ): Promise<string> {
    return this.publishToTopicRaw(topic, Buffer.from(JSON.stringify(data)), attributes);
  }

  async publishRaw(
    token: Token,
    data: Buffer,
    attributes: Record<string, string>
  ): Promise<string> {
    return this.publishToTopicRaw(this.pubSubService.getTopic(token), data, attributes);
  }

  async publishToTopicRaw(
    topic: Topic,
    data: Buffer,
    attributes: Record<string, string>
  ): Promise<string> {
    const messageId = (await topic.publishMessage({ data, attributes })) || '';
    if (!messageId) {
      throw new PubSubTimeoutError();
    }
    return messageId;
  }
}

export class PubSubTimeoutError extends InternalServerErrorException {
  constructor() {
    super('Request timeout');
  }
}
