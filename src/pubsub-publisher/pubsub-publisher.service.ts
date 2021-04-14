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
    body: Record<string, unknown>,
    attributes: Record<string, string>
  ): Promise<string> {
    return this.publishToTopic(this.pubSubService.getTopic(token), body, attributes);
  }

  async publishToTopic(
    topic: Topic,
    body: Record<string, unknown>,
    attributes: Record<string, string>
  ): Promise<string> {
    return await Promise.race([
      topic.publishJSON(body, attributes),
      new Promise<string>((_, reject) =>
        setTimeout(() => reject(new PubSubTimeoutError()), this.settings.requestTimeoutMillis)
      ),
    ]);
  }
}

export class PubSubTimeoutError extends InternalServerErrorException {
  constructor() {
    super('Request timeout');
  }
}
