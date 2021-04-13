import { PubSub, Subscription, Topic } from '@google-cloud/pubsub';
import { Test, TestingModule } from '@nestjs/testing';
import { getSubscriptionToken, getTopicToken, PubSubModule } from '../nestjs-pubsub-core';
import { pubSubFactory } from './pubsub.module';

describe('PubSubModule', () => {
  let pubSubModule: TestingModule;

  const subscriptionMock: Partial<Subscription> = {};
  const topicMock: Partial<Topic> = {
    subscription: jest.fn().mockReturnValue(subscriptionMock),
  };
  const pubSubMock: Partial<PubSub> = {
    topic: jest.fn().mockReturnValue(topicMock),
  };

  const topic1 = 'topic1';
  const topic2 = 'topic2';
  const subscription11 = 'subscription11';
  const subscription12 = 'subscription12';
  const subscription21 = 'subscription21';
  const subscription22 = 'subscription22';

  beforeEach(async () => {
    pubSubModule = await Test.createTestingModule({
      imports: [
        PubSubModule.forRoot({
          pubSub: pubSubMock as PubSub,
          topics: {
            [topic1]: {
              name: 't1',
              subscriptions: {
                [subscription11]: { name: 't1s1' },
                [subscription12]: { name: 't1s2' },
              },
            },
            [topic2]: {
              name: 't2',
              subscriptions: {
                [subscription21]: { name: 't2s1' },
                [subscription22]: { name: 't2s2' },
              },
            },
            topic3: {
              name: 't3',
            },
          },
        }),
        PubSubModule.forFeature({
          topics: [topic1, topic2],
          subscriptions: [subscription11, subscription12, subscription21, subscription22],
        }),
      ],
    }).compile();
  });

  it('is defined', () => {
    expect(pubSubModule).toBeDefined();
  });

  it('provides topics', () => {
    const t1 = pubSubModule.get(getTopicToken(topic1));
    const t2 = pubSubModule.get(getTopicToken(topic2));

    expect(t1).toBeDefined();
    expect(t2).toBeDefined();
  });

  it('provides subscriptions', () => {
    const t1s1 = pubSubModule.get(getSubscriptionToken(subscription11));
    const t1s2 = pubSubModule.get(getSubscriptionToken(subscription12));
    const t2s1 = pubSubModule.get(getSubscriptionToken(subscription21));
    const t2s2 = pubSubModule.get(getSubscriptionToken(subscription22));

    expect(t1s1).toBeDefined();
    expect(t1s2).toBeDefined();
    expect(t2s1).toBeDefined();
    expect(t2s2).toBeDefined();
  });

  describe('when misconfigured', () => {
    it('throws when trying to inject unknown topic', async () => {
      await expect(
        Test.createTestingModule({
          imports: [
            PubSubModule.forRoot({
              pubSub: {} as PubSub,
              topics: {},
            }),
            PubSubModule.forFeature({
              topics: ['unknown-topic'],
            }),
          ],
        }).compile()
      ).rejects.toThrow(new Error('Cannot find topic by alias: unknown-topic'));
    });

    it('throws when trying to inject unknown subscription', async () => {
      await expect(
        Test.createTestingModule({
          imports: [
            PubSubModule.forRoot({
              pubSub: {} as PubSub,
              topics: {},
            }),
            PubSubModule.forFeature({
              subscriptions: ['unknown-subscription'],
            }),
          ],
        }).compile()
      ).rejects.toThrow(new Error('Cannot find subscription by alias: unknown-subscription'));
    });
  });

  describe('pubSubFactory', () => {
    it('returns passed PubSub', () => {
      const pubSubMock = (1 as unknown) as PubSub;

      const res = pubSubFactory({
        pubSub: pubSubMock,
        topics: {},
      });

      expect(res).toBe(pubSubMock);
    });

    it('creates PubSub bases on config', () => {
      const res = pubSubFactory({
        pubSubSettings: { projectId: 'abc' },
        topics: {},
      });

      expect(res).toBeInstanceOf(PubSub);
      expect(res.options.projectId).toBe('abc');
    });
  });
});
