import { Inject } from '@nestjs/common';
import { getToken, Token } from './token';

export const getSubscriptionToken = (subscriptionName: Token): Token =>
  getToken(subscriptionName, 'Subscription');

export const InjectSubscription = (subscriptionName: Token): ParameterDecorator =>
  Inject(getSubscriptionToken(subscriptionName));
