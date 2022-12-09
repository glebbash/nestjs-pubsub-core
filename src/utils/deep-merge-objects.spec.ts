import { mergeObjects } from './deep-merge-object';

describe('deep merge two objects', () => {
  it('merges two objects with nested values', () => {
    const retryDefaults = {
      prop1: 'prop should stay',
      retry: {
        backoffSettings: {
          prop2: 'prop should stay',
          timeoutInMillis: 1,
        },
      },
    };
    const options = {
      prop3: 'prop should stay',
      retry: {
        backoffSettings: {
          timeoutInMillis: 100,
          prop4: 'prop should stay',
        },
      },
    };
    expect(mergeObjects(retryDefaults, options)).toEqual({
      prop1: 'prop should stay',
      prop3: 'prop should stay',
      retry: {
        backoffSettings: {
          timeoutInMillis: 100,
          prop2: 'prop should stay',
          prop4: 'prop should stay',
        },
      },
    });
  });
});
