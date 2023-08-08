import { DynamicModule, Module } from '@nestjs/common';
import { AsyncSettings, SettingsProvider } from '../utils/settings-provider';
import { PubSubService } from '../pubsub/pubsub.service';
import { PubSubPublisherService } from './pubsub-publisher.service';
import { PublishOptions } from '@google-cloud/pubsub';

export const PubSubPublisherSettings = Symbol('PubSubPublisherSettings');
export type PubSubPublisherSettings = {
  requestTimeoutMillis: number;
  batching?: PublishOptions['batching'];
};

@Module({})
export class PubSubPublisherModule {
  static forFeature(settings: PubSubPublisherSettings): DynamicModule {
    return PubSubPublisherModule.forFeatureAsync({ useValue: settings });
  }

  static forFeatureAsync(settings: AsyncSettings<PubSubPublisherSettings>): DynamicModule {
    return {
      module: PubSubPublisherModule,
      providers: [
        <SettingsProvider<PubSubPublisherSettings>>{
          provide: PubSubPublisherSettings,
          ...settings,
        },
        {
          provide: PubSubPublisherService,
          inject: [PubSubService, PubSubPublisherSettings],
          useFactory: (service: PubSubService, settings: PubSubPublisherSettings) =>
            new PubSubPublisherService(service, settings),
        },
      ],
      exports: [PubSubPublisherService],
    };
  }
}
