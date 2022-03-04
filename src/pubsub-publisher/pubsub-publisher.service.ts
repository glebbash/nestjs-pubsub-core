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
    return this.publishToTopic(this.pubSubService.getTopic(token), data, attributes);
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
    const timeout = setTimeoutAsync(this.settings.requestTimeoutMillis);

    const [result] = await Promise.race([
      topic.publishMessage({ data, attributes }),
      timeout.then(() => {
        throw new PubSubTimeoutError();
      }),
    ]);

    timeout.clear();

    return result;
  }
}

function setTimeoutAsync(millis: number) {
  let timeoutResolve: () => void;
  let timeout: NodeJS.Timeout;
  const promise = new Promise<void>((resolve) => {
    timeoutResolve = resolve;
    timeout = setTimeout(() => resolve(), millis);
  });
  return Object.assign(promise, {
    clear: () => {
      clearTimeout(timeout);
      timeoutResolve();
    },
  });
}

export class PubSubTimeoutError extends InternalServerErrorException {
  constructor() {
    super('Request timeout');
  }
}
