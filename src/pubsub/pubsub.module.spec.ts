import { PubSub } from '@google-cloud/pubsub';
import { Test, TestingModule } from '@nestjs/testing';
import { getSubscriptionToken, getTopicToken, PubSubModule } from '../nestjs-pubsub-core';
import { pubSubFactory, PubSubSettings } from './pubsub.module';
import { PubSubService } from './pubsub.service';

describe('PubSubModule', () => {
  let pubSubModule: TestingModule;

  const topic1 = 'topic1';
  const subscription11 = 'subscription11';
  const subscription12 = 'subscription12';

  const topic2 = Symbol('topic2');
  const subscription21 = Symbol('subscription21');
  const subscription22 = Symbol('subscription22');

  beforeEach(async () => {
    pubSubModule = await Test.createTestingModule({
      imports: [
        PubSubModule.forRoot({
          pubSub: new PubSub(),
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

  it('returns accesed topics and subscriptions correctly', () => {
    const ps = pubSubModule.get(PubSubService);

    const t1 = ps.getTopic(topic1);
    const s1 = ps.getSubscription(subscription11);
    const s2 = ps.getSubscription(subscription12);

    expect(ps.getAllAccessedTopics()).toContain(t1);
    expect(ps.getAllAccessedSubscriptions()).toContain(s1);
    expect(ps.getAllAccessedSubscriptions()).toContain(s2);
  });

  it('closes pubsub in onModuleDestroy', async () => {
    const service = pubSubModule.get(PubSubService);

    const closeSpy = jest.spyOn(service.pubSub, 'close').mockResolvedValue(0 as never);

    await service.onModuleDestroy();

    expect(closeSpy).toBeCalled();
  });

  it('does not close pubsub if closeOnModuleDestroy is set to false', async () => {
    const service = pubSubModule.get(PubSubService) as Omit<PubSubService, 'settings'> & {
      settings: PubSubSettings;
    };
    service.settings.closeOnModuleDestroy = false;

    const closeSpy = jest.spyOn(service.pubSub, 'close').mockResolvedValue(0 as never);

    await service.onModuleDestroy();

    expect(closeSpy).not.toBeCalled();
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
      const pubSubMock = new PubSub();

      const res = pubSubFactory({
        pubSub: pubSubMock,
        topics: {},
      });

      expect(res).toBe(pubSubMock);
    });

    it('creates PubSub based on config', () => {
      const res = pubSubFactory({
        pubSubSettings: { projectId: 'abc' },
        topics: {},
      });

      expect(res).toBeInstanceOf(PubSub);
      expect(res.options.projectId).toBe('abc');
    });

    it('creates PubSub config for emulator', () => {
      const res = pubSubFactory({
        pubSubSettings: { projectId: 'abc', emulatorPort: 1234 },
        topics: {},
      });

      expect(res).toBeInstanceOf(PubSub);
      expect(res.options.projectId).toBe('abc');
      expect(res.options.port).toBe(1234);
      expect(res.options.servicePath).toBe('localhost');
    });
  });
});
