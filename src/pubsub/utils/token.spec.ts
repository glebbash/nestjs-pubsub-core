import { getToken } from './token';

describe('get-token', () => {
  it('returns passed symbol', () => {
    const key = Symbol('unique');

    expect(getToken(key, 'Topic')).toBe(key);
  });

  it('returns postfixed key', () => {
    expect(getToken('Nice', 'Topic')).toBe('NiceTopic');
  });
});
