import { DynamicModule, Module } from '@nestjs/common';
import { ClientConfig, PubSub, SubscriptionOptions } from '@google-cloud/pubsub';
import { getSubscriptionToken, getTopicToken } from '../nestjs-pubsub-core';
import { PublishOptions } from '@google-cloud/pubsub/build/src/publisher';
import { PubSubService } from './pubsub.service';
import { Token } from '../utils/token';
import { AsyncSettings, SettingsProvider } from '../utils/settings-provider';
import { credentials } from '@grpc/grpc-js';

export const PubSubSettings = Symbol('PubSubSettings');
export type PubSubSettings = PubSubInstanceOrSettings & {
  topics: Record<Token, TopicSettings>;
  /**
   * By default all accessed subscription and pubsub instanc
   * will be closed on module destroy. You can disable this
   * behavior by setting this to false.
   */
  closeOnModuleDestroy?: false;
};

export type PubSubInstanceOrSettings =
  | {
      pubSub: PubSub;
      pubSubSettings?: undefined;
    }
  | {
      pubSub?: undefined;
      pubSubSettings: PubSubClientSettings;
    };

/**
 * If emulatorPort is provided this fields are set:
 *   servicePath: 'localhost',
 *   port: emulatorPort,
 *   sslCreds: credentials.createInsecure(),
 */
export type PubSubClientSettings = { emulatorPort?: number } & ClientConfig;

export const getClientConfig = (settings?: PubSubClientSettings): ClientConfig | undefined => {
  if (!settings) return undefined;

  const { emulatorPort, ...config } = settings;

  return emulatorPort
    ? {
        servicePath: 'localhost',
        port: emulatorPort,
        sslCreds: credentials.createInsecure(),
        ...config,
      }
    : config;
};

export const pubSubFactory = (settings: PubSubSettings): PubSub =>
  settings.pubSub ?? new PubSub(getClientConfig(settings.pubSubSettings));

export type TopicSettings = {
  name: string;
  options?: PublishOptions;
  subscriptions?: Record<Token, SubscriptionSettings>;
};

export type SubscriptionSettings = {
  name: string;
  options?: SubscriptionOptions;
};

export type PubSubFeatureSettings = {
  topics?: Token[];
  subscriptions?: Token[];
};

@Module({})
export class PubSubModule {
  static forRoot(settings: PubSubSettings): DynamicModule {
    return PubSubModule.forRootAsync({ useValue: settings });
  }

  static forRootAsync(settings: AsyncSettings<PubSubSettings>): DynamicModule {
    return {
      module: PubSubModule,
      global: true,
      providers: [
        <SettingsProvider<PubSubSettings>>{
          provide: PubSubSettings,
          ...settings,
        },
        {
          provide: PubSub,
          inject: [PubSubSettings],
          useFactory: pubSubFactory,
        },
        {
          provide: PubSubService,
          inject: [PubSub, PubSubSettings],
          useFactory: (pubSub: PubSub, settings: PubSubSettings) =>
            new PubSubService(pubSub, settings),
        },
      ],
      exports: [PubSubService],
    };
  }

  static forFeature(settings: PubSubFeatureSettings): DynamicModule {
    const providers = [
      ...(settings.topics ?? []).map((topic) => ({
        provide: getTopicToken(topic),
        inject: [PubSubService],
        useFactory: (service: PubSubService) => service.getTopic(topic),
      })),
      ...(settings.subscriptions ?? []).map((subscription) => ({
        provide: getSubscriptionToken(subscription),
        inject: [PubSubService],
        useFactory: (service: PubSubService) => service.getSubscription(subscription),
      })),
    ];

    return {
      module: PubSubModule,
      providers: providers,
      exports: providers,
    };
  }
}
