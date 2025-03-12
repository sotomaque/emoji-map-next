/**
 * Generic cached response type that can be used for any API response
 * that includes cache information.
 *
 * @template T - The type of data contained in the response
 */
export type CachedResponse<T> = {
  /** Whether the response was served from cache */
  cacheHit: boolean;

  /** The number of items in the response */
  count: number;

  /** The actual data */
  data: T;
};
