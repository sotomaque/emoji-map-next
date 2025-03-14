import { describe, it, expect } from 'vitest';
import { PHOTOS_CONFIG } from '@/constants/photos';
import { env } from '@/env';
import { buildPhotoUrl } from './build-photo-url';

describe('buildPhotoUrl', () => {
  it('should build a photo URL with default max height', () => {
    // GIVEN a photo name
    const photoName = 'places/123/photos/456';

    // WHEN building the photo URL
    const result = buildPhotoUrl({ photoName });

    // THEN the photo URL should be built correctly
    expect(result).toBe(
      `${env.GOOGLE_PLACES_URL}/${photoName}/media?max_height_px=${PHOTOS_CONFIG.DEFAULT_MAX_HEIGHT}&skipHttpRedirect=false&key=${env.GOOGLE_PLACES_API_KEY}`
    );
  });

  it('should build a photo URL with custom max height', () => {
    // GIVEN a photo name and a custom max height
    const photoName = 'places/123/photos/456';
    const maxHeight = 800;

    // WHEN building the photo URL
    const result = buildPhotoUrl({ photoName, maxHeight });

    // THEN the photo URL should be built correctly
    expect(result).toBe(
      `${env.GOOGLE_PLACES_URL}/${photoName}/media?max_height_px=${maxHeight}&skipHttpRedirect=false&key=${env.GOOGLE_PLACES_API_KEY}`
    );
  });

  it('should handle photo names with special characters', () => {
    // GIVEN a photo name with special characters
    const photoName = 'places/abc-123/photos/def_456';

    // WHEN building the photo URL
    const result = buildPhotoUrl({ photoName });

    // THEN the photo URL should be built correctly
    expect(result).toBe(
      `${env.GOOGLE_PLACES_URL}/${photoName}/media?max_height_px=${PHOTOS_CONFIG.DEFAULT_MAX_HEIGHT}&skipHttpRedirect=false&key=${env.GOOGLE_PLACES_API_KEY}`
    );
  });

  it('should use default max height when zero is provided', () => {
    // GIVEN a photo name and a zero max height
    const photoName = 'places/123/photos/456';
    const maxHeight = 0; // Invalid height, should use default

    // WHEN building the photo URL
    const result = buildPhotoUrl({ photoName, maxHeight });

    // THEN the photo URL should use the default height
    expect(result).toBe(
      `${env.GOOGLE_PLACES_URL}/${photoName}/media?max_height_px=${PHOTOS_CONFIG.DEFAULT_MAX_HEIGHT}&skipHttpRedirect=false&key=${env.GOOGLE_PLACES_API_KEY}`
    );
  });

  it('should use default max height when negative value is provided', () => {
    // GIVEN a photo name and a negative max height
    const photoName = 'places/123/photos/456';
    const maxHeight = -100; // Invalid height, should use default

    // WHEN building the photo URL
    const result = buildPhotoUrl({ photoName, maxHeight });

    // THEN the photo URL should use the default height
    expect(result).toBe(
      `${env.GOOGLE_PLACES_URL}/${photoName}/media?max_height_px=${PHOTOS_CONFIG.DEFAULT_MAX_HEIGHT}&skipHttpRedirect=false&key=${env.GOOGLE_PLACES_API_KEY}`
    );
  });

  it('should use default max height when NaN is provided', () => {
    // GIVEN a photo name and NaN as max height
    const photoName = 'places/123/photos/456';
    const maxHeight = NaN; // Invalid height, should use default

    // WHEN building the photo URL
    const result = buildPhotoUrl({ photoName, maxHeight });

    // THEN the photo URL should use the default height
    expect(result).toBe(
      `${env.GOOGLE_PLACES_URL}/${photoName}/media?max_height_px=${PHOTOS_CONFIG.DEFAULT_MAX_HEIGHT}&skipHttpRedirect=false&key=${env.GOOGLE_PLACES_API_KEY}`
    );
  });

  it('should use default max height when Infinity is provided', () => {
    // GIVEN a photo name and Infinity as max height
    const photoName = 'places/123/photos/456';
    const maxHeight = Infinity; // Invalid height, should use default

    // WHEN building the photo URL
    const result = buildPhotoUrl({ photoName, maxHeight });

    // THEN the photo URL should use the default height
    expect(result).toBe(
      `${env.GOOGLE_PLACES_URL}/${photoName}/media?max_height_px=${PHOTOS_CONFIG.DEFAULT_MAX_HEIGHT}&skipHttpRedirect=false&key=${env.GOOGLE_PLACES_API_KEY}`
    );
  });

  it('should use default max height when value exceeds maximum limit', () => {
    // GIVEN a photo name and a max height that exceeds the limit
    const photoName = 'places/123/photos/456';
    const maxHeight = 5000; // Exceeds limit of 4000, should use default

    // WHEN building the photo URL
    const result = buildPhotoUrl({ photoName, maxHeight });

    // THEN the photo URL should use the default height
    expect(result).toBe(
      `${env.GOOGLE_PLACES_URL}/${photoName}/media?max_height_px=${PHOTOS_CONFIG.DEFAULT_MAX_HEIGHT}&skipHttpRedirect=false&key=${env.GOOGLE_PLACES_API_KEY}`
    );
  });

  it('should throw an error when photoName is empty', () => {
    // GIVEN an empty photo name
    const photoName = '';

    // WHEN building the photo URL
    // THEN an error should be thrown
    expect(() => buildPhotoUrl({ photoName })).toThrow(
      'Photo name is required'
    );
  });

  it('should throw an error when photoName is undefined', () => {
    // GIVEN an undefined photo name
    // WHEN building the photo URL
    // THEN an error should be thrown
    // @ts-expect-error Testing invalid input
    expect(() => buildPhotoUrl({ photoName: undefined })).toThrow(
      'Photo name is required'
    );
  });

  it('should throw an error when photoName is null', () => {
    // GIVEN a null photo name
    // WHEN building the photo URL
    // THEN an error should be thrown
    // @ts-expect-error Testing invalid input
    expect(() => buildPhotoUrl({ photoName: null })).toThrow(
      'Photo name is required'
    );
  });
});
