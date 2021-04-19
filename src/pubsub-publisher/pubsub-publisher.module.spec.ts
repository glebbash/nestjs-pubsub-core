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
          topics: { [MainTopic]: { name: 'main-topic' } },
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

    const mockedRes = 'abc';
    const publishJsonMock = jest.spyOn(topic, 'publishJSON').mockResolvedValue(mockedRes as never);
    const clearTimeoutMock = jest.spyOn(global, 'clearTimeout');

    const body = {
      a: 1,
    };
    const attributes = {
      event: 'created',
    };

    const res = await service.publish(MainTopic, body, attributes);

    expect(res).toBe(mockedRes);
    expect(publishJsonMock).toBeCalledWith(body, attributes);
    expect(clearTimeoutMock).toBeCalled();
  });

  it('rejects with PubSubTimeoutError if publishing hangs', async () => {
    const service = publisherModule.get(PubSubPublisherService);
    const pubSubService = publisherModule.get(PubSubService);
    const topic = pubSubService.getTopic(MainTopic);

    jest.spyOn(topic, 'publishJSON').mockReturnValue(new Promise(() => 0) as never);

    await expect(service.publish(MainTopic, {}, {})).rejects.toThrow(PubSubTimeoutError);
  });
});
