import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

/**
 * Read a client-only value (e.g. from `localStorage` or `window`) without
 * triggering a `setState` inside an effect.
 *
 * During SSR and the first hydration pass the `serverFallback` is returned,
 * then React swaps in the real client value via `useSyncExternalStore`. The
 * getter must return a primitive (or a stable reference) to avoid re-render
 * loops.
 */
export function useClientValue<T>(getClient: () => T, serverFallback: T): T {
  return useSyncExternalStore(emptySubscribe, getClient, () => serverFallback);
}
