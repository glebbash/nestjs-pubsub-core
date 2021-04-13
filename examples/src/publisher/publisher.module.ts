import { Module } from '@nestjs/common';
import { PubSubModule } from '../../../src/pubsub/pubsub.module';
import { MainSubscription, MainTopic } from './publisher.constants';
import { PublisherService } from './publisher.service';

@Module({
  imports: [
    PubSubModule.forFeature({
      topics: [MainTopic],
      subscriptions: [MainSubscription],
    }),
  ],
  providers: [PublisherService],
  exports: [PublisherService],
})
export class PublisherModule {}
