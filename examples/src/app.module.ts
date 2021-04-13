/* eslint-disable @typescript-eslint/no-explicit-any */

import { Module } from '@nestjs/common';
import { PubSubModule } from '../../src/nestjs-pubsub-core';
import { MainSubscription, MainTopic } from './publisher/publisher.constants';
import { PublisherModule } from './publisher/publisher.module';

@Module({
  imports: [
    PubSubModule.forRootAsync({
      inject: ['config'],
      useFactory: (config: any) => ({
        pubSubSettings: {
          projectId: config.projectId,
        },
        topics: {
          [MainTopic /* topic token (alias), used for injection */]: {
            name: config.mainTopicName, // name of actual topic
            subscriptions: {
              [MainSubscription /* subscription token (alias), used for injection */]: {
                // NOTE: subscription alias must be unique across all topics
                //       as it is used during dependency injection
                name: config.mainSubscriptionName, // name of actual subscription
              },
            },
          },
        },
      }),
    }),
    PublisherModule,
  ],
})
export class AppModule {}
