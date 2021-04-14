import type { Provider, Type } from '@nestjs/common';

export type SettingsProvider<T> = Exclude<Provider<T>, Type>;
export type AsyncSettings<T> = Omit<SettingsProvider<T>, 'provide'>;
