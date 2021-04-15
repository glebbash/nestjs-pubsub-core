import type { Provider, Type } from '@nestjs/common';

type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;

export type SettingsProvider<T> = Exclude<Provider<T>, Type>;
export type AsyncSettings<T> = DistributiveOmit<SettingsProvider<T>, 'provide'>;
