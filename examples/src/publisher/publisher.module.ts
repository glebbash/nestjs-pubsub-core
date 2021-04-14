import { Module } from '@nestjs/common';
import { PubSubModule, PubSubPublisherModule } from '../../../src/nestjs-pubsub-core';
import { MainSubscription, MainTopic } from './publisher.constants';
import { PublisherService } from './publisher.service';

@Module({
  imports: [
    PubSubModule.forFeature({
      topics: [MainTopic],
      subscriptions: [MainSubscription],
    }),
    // this provides PubSubPublisherService
    PubSubPublisherModule.forFeature({
      requestTimeoutMillis: 5000,
    }),
  ],
  providers: [PublisherService],
  exports: [PublisherService],
})
export class PublisherModule {}
