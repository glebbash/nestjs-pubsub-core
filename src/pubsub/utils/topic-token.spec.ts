jest.mock('@nestjs/common');
import { Inject } from '@nestjs/common';
import { getTopicToken, InjectTopic } from './topic-token';

describe('topic-token', () => {
  describe('getTopicToken', () => {
    it('returns correct token', () => {
      const token = getTopicToken('abc');

      expect(token).toBe('abcTopic');
    });
  });

  describe('InjectTopic', () => {
    it('returns correct token', () => {
      InjectTopic('abc');

      expect(Inject).toBeCalledWith('abcTopic');
    });
  });
});
