# Nearby Places API

The Nearby Places API allows you to search for places near a specific location with powerful filtering and sorting capabilities. This endpoint is ideal for location-based applications, map interfaces, and discovery features.

{% callout type="info" %}
This API uses the Google Places API under the hood and enhances the results with our custom emoji categorization system, making it easier to visually identify place types.
{% /callout %}

## Implementation Details

The Nearby Places API:
- Accepts a location coordinate and optional parameters
- Queries the Google Places API with optimized parameters
- Processes and categorizes results with our emoji mapping system
- Returns standardized place data with consistent formatting
- Handles caching to improve performance and reduce API costs

## Use Cases

- **Location-based discovery**: Find restaurants, attractions, or services near a user's current location
- **Map-based applications**: Display points of interest on a map interface
- **Travel planning**: Find places to visit near a destination
- **Local search**: Allow users to search for specific types of places in their area

## Endpoints

{% endpoint method="GET" path="/api/places/nearby" description="Get places near a specific location with optional filtering" %}

### Query Parameters

{% param name="location" type="string" required=true description="Latitude and longitude in the format 'lat,lng'" %}
The center point for the nearby search. Must be provided as a comma-separated pair of coordinates.

**Example**: `40.7128,-74.0060` for New York City
{% /param %}

{% param name="limit" type="number" description="Maximum number of results to return (default: 20, max: 60)" %}
Controls the number of results returned by the API. The API will return at most this many results.

**Default**: 20  
**Maximum**: 60

**Note**: Higher limits may increase response time.
{% /param %}

{% param name="buffer" type="number" description="Search radius in miles (default: 15, max: 100)" %}
Defines the search radius around the specified location. The API will search for places within this radius.

**Default**: 15 miles  
**Maximum**: 100 miles

**Note**: Larger buffer sizes may return more diverse results but can increase response time.
{% /param %}

{% param name="text_query" type="string" description="Filter results by category or keyword" %}
Filters the results to match specific categories or keywords. This parameter is highly flexible and can be used to find specific types of places.

You can use pipe-separated values to search for multiple categories or keywords, which will return places matching any of the specified terms.

**Examples**:
- `pizza` - Find pizza places
- `pizza|burger` - Find pizza or burger places
- `coffee shop` - Find coffee shops
- `museum|gallery|art` - Find museums, galleries, or places with "art" in their name or category
{% /param %}

{% param name="rank_preference" type="string" description="How to rank results (default: 'DISTANCE')" %}
Controls the order in which results are returned.

**Possible values**:
- `DISTANCE`: Rank by distance from the specified location (closest first)
- `RELEVANCE`: Rank by relevance to the search query (most relevant first)

**Default**: `DISTANCE`

**Note**: When using `text_query`, `RELEVANCE` often provides better results.
{% /param %}

### Response Structure

{% response status=200 description="Successful response" %}
Returns a cached response containing an array of places near the specified location.

{% code language="typescript" title="Response Structure" %}
// The main response type
interface PlacesResponse {
  data: Place[];       // Array of places matching the query
  cacheHit: boolean;   // Whether the response was served from cache
  count: number;       // Number of places returned
}

// The Place object structure
interface Place {
  id: string;            // Unique identifier for the place
  name: string;          // Name of the place
  location: {            // Geographic coordinates
    lat: number;         // Latitude
    lng: number;         // Longitude
  };
  address: string;       // Formatted address
  category: {            // Category information
    key: number;         // Category ID
    emoji: string;       // Emoji representation of the category
    name: string;        // Category name
  };
  rating?: number;       // Average rating (0-5)
  user_ratings_total?: number; // Number of user ratings
  price_level?: number;  // Price level (1-4, where 1 is least expensive)
  vicinity?: string;     // Simplified address
  photos?: string[];     // Array of photo URLs (if available)
}
{% /code %}

#### Example Response

{% code language="json" title="Example Response" %}
{
  "data": [
    {
      "id": "ChIJgVvTYZNYwokRRcOYJq4rJoo",
      "name": "Joe's Pizza",
      "location": {
        "lat": 40.7308838,
        "lng": -73.9973379
      },
      "address": "7 Carmine St, New York, NY 10014, USA",
      "category": {
        "key": 13,
        "emoji": "🍕",
        "name": "Pizza"
      },
      "rating": 4.7,
      "user_ratings_total": 5612,
      "price_level": 1,
      "vicinity": "7 Carmine Street, New York",
      "photos": [
        "https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photoreference=..."
      ]
    },
    // More places...
  ],
  "cacheHit": false,
  "count": 20
}
{% /code %}
{% /response %}

{% response status=400 description="Bad request" %}
Returned when the request parameters are invalid or missing required fields.

#### Common Error Cases
- Missing or invalid location format
- Invalid limit or buffer values
- Malformed text_query

{% code language="json" title="Example Error Response" %}
{
  "error": "Invalid location format. Expected 'lat,lng'."
}
{% /code %}
{% /response %}

{% response status=500 description="Server error" %}
Returned when there's an error processing the request or communicating with the underlying services.

{% code language="json" title="Example Error Response" %}
{
  "error": "Failed to fetch places from Google API."
}
{% /code %}
{% /response %}

### Examples

#### Basic Usage

{% code language="typescript" title="Basic Request" %}
// Fetch nearby pizza places in New York City
const response = await fetch('/api/places/nearby?location=40.7128,-74.0060&text_query=pizza&limit=5');
const result = await response.json();

// Access the places array from the data property
const places = result.data;
console.log(`Found ${result.count} pizza places near NYC (cache hit: ${result.cacheHit})`);

// Process the places
places.forEach(place => {
  console.log(`${place.name} - ${place.category.emoji} (${place.rating || 'No rating'})`);
});
{% /code %}

#### Advanced Usage

{% code language="typescript" title="Advanced Request with Error Handling" %}
async function findNearbyPlaces(lat, lng, query, options = {}) {
  const { limit = 20, buffer = 15, rankBy = 'DISTANCE' } = options;
  
  try {
    const url = new URL('/api/places/nearby', window.location.origin);
    url.searchParams.append('location', `${lat},${lng}`);
    
    if (query) {
      url.searchParams.append('text_query', query);
    }
    
    url.searchParams.append('limit', limit.toString());
    url.searchParams.append('buffer', buffer.toString());
    url.searchParams.append('rank_preference', rankBy);
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error ${response.status}`);
    }
    
    const result = await response.json();
    return {
      places: result.data,
      count: result.count,
      fromCache: result.cacheHit
    };
  } catch (error) {
    console.error('Error finding nearby places:', error);
    throw error;
  }
}

// Usage
try {
  // Find coffee shops within 5 miles of current location
  navigator.geolocation.getCurrentPosition(async (position) => {
    const { latitude, longitude } = position.coords;
    const { places, count, fromCache } = await findNearbyPlaces(
      latitude, 
      longitude, 
      'coffee shop', 
      { buffer: 5, rankBy: 'RELEVANCE' }
    );
    
    console.log(`Found ${count} coffee shops nearby (from cache: ${fromCache})`);
    
    // Process the places
    displayPlacesOnMap(places);
  });
} catch (error) {
  // Handle error
  showErrorMessage('Failed to find nearby places');
}
{% /code %}

### Implementation Notes

- The API uses caching to improve performance and reduce load on the Google Places API
- Results are enriched with our emoji categorization system
- The buffer parameter is converted to meters when calling the Google Places API
- For optimal performance, keep the buffer size reasonable and use specific text queries
- The `cacheHit` property indicates whether the response was served from our cache

{% /endpoint %} 