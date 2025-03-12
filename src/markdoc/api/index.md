# Emoji Map API Documentation

Welcome to the Emoji Map API documentation. This documentation provides comprehensive information about the available API endpoints, request parameters, response formats, and examples to help you integrate with our services.

{% callout type="info" title="API Base URL" %}
All API endpoints are relative to the base URL of your Emoji Map instance. For local development, this is typically `http://localhost:3000`.
{% /callout %}

## Overview

Emoji Map provides a set of RESTful APIs that allow you to:

- Search for places near a specific location
- Retrieve detailed information about specific places
- Access photos for places
- Get category information with emoji representations

Our APIs are designed to be simple to use, well-documented, and follow REST principles.

## Available APIs

### Places API

The Places API provides access to information about places, including nearby places, place details, and place photos.

{% callout type="note" %}
All Places API endpoints use data from the Google Places API but return results in our standardized format with additional emoji categorization.
{% /callout %}

#### Response Format

All Places API endpoints return responses in a consistent format that includes:

{% code language="typescript" title="Common Response Structure" %}
// Generic cached response type used by all endpoints
interface CachedResponse<T> {
  data: T;           // The actual data returned by the endpoint
  cacheHit: boolean; // Whether the response was served from cache
  count: number;     // Count of items in the data array
}

// Example for Nearby Places API
type PlacesResponse = CachedResponse<Place[]>;

// Example for Place Details API
type PlaceDetailsResponse = CachedResponse<PlaceDetail>;

// Example for Place Photos API
type PlacePhotosResponse = CachedResponse<string[]>;
{% /code %}

#### Endpoints

- [**Nearby Places API**](/docs/api/places/nearby) - Search for places near a specific location with filtering options
- [**Place Details API**](/docs/api/places/details) - Get comprehensive information about a specific place
- [**Place Photos API**](/docs/api/places/photos) - Retrieve photos for a specific place

## Authentication

{% callout type="warning" title="Authentication Required" %}
Some API endpoints may require authentication. Authentication is handled via secure HTTP-only cookies after logging in through our authentication system.

For endpoints requiring authentication, you must include your session cookie with requests.
{% /callout %}

## Error Handling

All API endpoints return standard HTTP status codes to indicate success or failure:

- `200 OK` - The request was successful
- `400 Bad Request` - The request was invalid or cannot be served
- `401 Unauthorized` - Authentication is required or failed
- `403 Forbidden` - The request is understood but refused
- `404 Not Found` - The requested resource could not be found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - An error occurred on the server

Error responses include a JSON object with an `error` field containing a human-readable error message:

{% code language="json" title="Example Error Response" %}
{
  "error": "Invalid location format. Expected 'lat,lng'."
}
{% /code %}

## Client Libraries

While you can use any HTTP client to interact with our API, we recommend using fetch in browser environments or libraries like axios for Node.js applications.

{% code language="typescript" title="Example Using Fetch" %}
// Example of fetching nearby places
async function getNearbyPlaces(lat, lng, query) {
  try {
    const response = await fetch(
      `/api/places/nearby?location=${lat},${lng}&text_query=${query}`
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch nearby places');
    }
    
    const result = await response.json();
    // Access the data array from the response
    const places = result.data;
    console.log(`Found ${result.count} places, cache hit: ${result.cacheHit}`);
    
    return places;
  } catch (error) {
    console.error('Error fetching nearby places:', error);
    throw error;
  }
}
{% /code %}