jest.mock('@nestjs/common');
import { Inject } from '@nestjs/common';
import { getSubscriptionToken, InjectSubscription } from './subscription-token';

describe('subscription-token', () => {
  describe('getSubscriptionToken', () => {
    it('returns correct token', () => {
      const token = getSubscriptionToken('abc');

      expect(token).toBe('abcSubscription');
    });
  });

  describe('InjectSubscription', () => {
    it('returns correct token', () => {
      InjectSubscription('abc');

      expect(Inject).toBeCalledWith('abcSubscription');
    });
  });
});
