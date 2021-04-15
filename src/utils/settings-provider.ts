import type { Provider, Type } from '@nestjs/common';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;

export type SettingsProvider<T> = Exclude<Provider<T>, Type>;
export type AsyncSettings<T> = DistributiveOmit<SettingsProvider<T>, 'provide'>;
