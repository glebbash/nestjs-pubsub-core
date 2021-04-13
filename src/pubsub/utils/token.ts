export type Token = string | symbol;

export const getToken = (key: Token, postfix: string): Token =>
  typeof key === 'symbol' ? key : `${key}${postfix}`;
