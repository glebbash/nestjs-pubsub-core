export type Token = string | symbol;

export const getToken = (name: Token, postfix: string): Token =>
  typeof name === 'symbol' ? name : `${name}${postfix}`;
