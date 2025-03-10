import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';

// Mock server setup
const server = setupServer(
  // Mock the nearby places endpoint
  http.get('/api/places/nearby', ({ request }) => {
    const url = new URL(request.url);
    const location = url.searchParams.get('location');
    const type = url.searchParams.get('type');

    if (!location) {
      return HttpResponse.json(
        { error: 'Missing required parameter: location' },
        { status: 400 }
      );
    }

    if (!type) {
      return HttpResponse.json(
        { error: 'Missing required parameter: type' },
        { status: 400 }
      );
    }

    return HttpResponse.json(
      {
        places: [
          {
            placeId: 'place123',
            name: 'Test Restaurant',
            coordinate: {
              latitude: 37.7749,
              longitude: -122.4194,
            },
            category: 'restaurant',
            description: '123 Test Street',
            priceLevel: 2,
            openNow: true,
            rating: 4.5,
          },
        ],
      },
      { status: 200 }
    );
  }),

  // Mock the place details endpoint
  http.get('/api/places/details', ({ request }) => {
    const url = new URL(request.url);
    const placeId = url.searchParams.get('placeId');

    if (!placeId) {
      return HttpResponse.json(
        { error: 'Missing required parameter: placeId' },
        { status: 400 }
      );
    }

    return HttpResponse.json(
      {
        placeDetails: {
          photos: [
            'https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=photo1&key=test-api-key',
            'https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=photo2&key=test-api-key',
          ],
          reviews: [
            {
              author: 'John Doe',
              text: 'Great place!',
              rating: 5,
            },
            {
              author: 'Jane Smith',
              text: 'Good food, but a bit pricey.',
              rating: 4,
            },
          ],
        },
      },
      { status: 200 }
    );
  })
);

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Close server after all tests
afterAll(() => server.close());

describe('Places API Integration Tests', () => {
  it('should fetch nearby places successfully', async () => {
    const response = await fetch(
      '/api/places/nearby?location=37.7749,-122.4194&type=restaurant'
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('places');
    expect(data.places).toBeInstanceOf(Array);
    expect(data.places.length).toBe(1);

    const place = data.places[0];
    expect(place).toHaveProperty('placeId', 'place123');
    expect(place).toHaveProperty('name', 'Test Restaurant');
    expect(place.coordinate).toHaveProperty('latitude', 37.7749);
    expect(place.coordinate).toHaveProperty('longitude', -122.4194);
  });

  it('should return 400 when location is missing for nearby places', async () => {
    const response = await fetch('/api/places/nearby?type=restaurant');
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toHaveProperty(
      'error',
      'Missing required parameter: location'
    );
  });

  it('should fetch place details successfully', async () => {
    const response = await fetch('/api/places/details?placeId=place123');
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('placeDetails');
    expect(data.placeDetails).toHaveProperty('photos');
    expect(data.placeDetails.photos.length).toBe(2);
    expect(data.placeDetails).toHaveProperty('reviews');
    expect(data.placeDetails.reviews.length).toBe(2);
  });

  it('should return 400 when placeId is missing for place details', async () => {
    const response = await fetch('/api/places/details');
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toHaveProperty('error', 'Missing required parameter: placeId');
  });

  it('should handle server errors for nearby places', async () => {
    // Override the handler to simulate a server error
    server.use(
      http.get('/api/places/nearby', () => {
        return HttpResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        );
      })
    );

    const response = await fetch(
      '/api/places/nearby?location=37.7749,-122.4194&type=restaurant'
    );
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toHaveProperty('error', 'Internal server error');
  });

  it('should handle server errors for place details', async () => {
    // Override the handler to simulate a server error
    server.use(
      http.get('/api/places/details', () => {
        return HttpResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        );
      })
    );

    const response = await fetch('/api/places/details?placeId=place123');
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toHaveProperty('error', 'Internal server error');
  });
});
