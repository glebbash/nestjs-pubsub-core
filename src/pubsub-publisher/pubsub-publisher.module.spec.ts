import { PubSub } from '@google-cloud/pubsub';
import { Test, TestingModule } from '@nestjs/testing';
import { PubSubService } from '../nestjs-pubsub-core';
import { PubSubModule } from '../pubsub/pubsub.module';
import { PubSubPublisherModule } from './pubsub-publisher.module';
import { PubSubPublisherService, PubSubTimeoutError } from './pubsub-publisher.service';

describe('PubSubPublisherModule', () => {
  let publisherModule: TestingModule;
  const MainTopic = Symbol('MainTopic');

  beforeEach(async () => {
    publisherModule = await Test.createTestingModule({
      imports: [
        PubSubModule.forRoot({
          pubSub: new PubSub(),
          topics: {
            [MainTopic]: { name: 'main-topic' },
          },
        }),
        PubSubPublisherModule.forFeature({
          requestTimeoutMillis: 200,
        }),
      ],
    }).compile();
  });

  it('is defined', () => {
    expect(publisherModule).toBeDefined();
  });

  it('publishes to topic', async () => {
    const service = publisherModule.get(PubSubPublisherService);
    const pubSubService = publisherModule.get(PubSubService);
    const topic = pubSubService.getTopic(MainTopic);

    const mockedRes = ['abc'];
    const publishJsonMock = jest
      .spyOn(topic, 'publishMessage')
      .mockResolvedValue(mockedRes as never);

    const data = {
      a: 1,
    };
    const attributes = {
      event: 'created',
    };

    const res = await service.publish(MainTopic, data, attributes);

    expect(res).toBe(mockedRes[0]);
    expect(publishJsonMock).toBeCalledWith({ data: Buffer.from(JSON.stringify(data)), attributes });
  });

  it('publishes to topic raw buffer', async () => {
    const service = publisherModule.get(PubSubPublisherService);
    const pubSubService = publisherModule.get(PubSubService);
    const topic = pubSubService.getTopic(MainTopic);

    const mockedRes = ['abc'];
    const publishJsonMock = jest
      .spyOn(topic, 'publishMessage')
      .mockResolvedValue(mockedRes as never);

    const data = Buffer.from('hello world');
    const attributes = {
      event: 'created',
    };

    const res = await service.publishRaw(MainTopic, data, attributes);

    expect(res).toBe(mockedRes[0]);
    expect(publishJsonMock).toBeCalledWith({ data, attributes });
  });

  it('rejects with PubSubTimeoutError if publishing hangs', async () => {
    const service = publisherModule.get(PubSubPublisherService);
    const pubSubService = publisherModule.get(PubSubService);
    const topic = pubSubService.getTopic(MainTopic);

    jest
      .spyOn(topic, 'publishMessage')
      // 250 because requestTimeoutMillis is set to 200
      .mockReturnValue(new Promise((resolve) => setTimeout(resolve, 250)) as never);

    await expect(service.publish(MainTopic, {}, {})).rejects.toThrow(PubSubTimeoutError);
  });
});
