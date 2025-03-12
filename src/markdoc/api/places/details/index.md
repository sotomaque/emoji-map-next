# Place Details API

The Place Details API provides comprehensive information about a specific place, including contact details, opening hours, reviews, and more. This endpoint is essential for displaying detailed place information in your application.

{% callout type="info" %}
This API uses the Google Places API under the hood and enhances the results with our custom emoji categorization system, providing a consistent data structure across all our APIs.
{% /callout %}

## Implementation Details

The Place Details API:
- Accepts a place ID and retrieves comprehensive details
- Fetches data from Google Places API with optimized fields
- Processes and standardizes the response format
- Adds emoji categorization based on place types
- Handles caching to improve performance and reduce API costs

## Use Cases

- **Place profile pages**: Display detailed information about a specific place
- **Business listings**: Show comprehensive business information including hours and contact details
- **Travel itineraries**: Include detailed place information in travel plans
- **Review platforms**: Display place details alongside user reviews

## Endpoints

{% endpoint method="GET" path="/api/places/details" description="Get detailed information about a specific place" %}

### Query Parameters

{% param name="id" type="string" required=true description="The unique identifier of the place" %}
The Google Places ID for the place. This is typically obtained from the Nearby Places API response.

**Example**: `ChIJgVvTYZNYwokRRcOYJq4rJoo` for Joe's Pizza in New York
{% /param %}

### Response Structure

{% response status=200 description="Successful response" %}
Returns a cached response containing detailed information about the specified place.

{% code language="typescript" title="Response Structure" %}
// The main response type
interface PlaceDetailsResponse {
  data: PlaceDetail;    // The place details object
  cacheHit: boolean;    // Whether the response was served from cache
  count: number;        // Always 1 for details endpoint
}

// The PlaceDetail object structure
interface PlaceDetail {
  id: string;                  // Unique identifier for the place
  name: string;                // Name of the place
  location: {                  // Geographic coordinates
    lat: number;               // Latitude
    lng: number;               // Longitude
  };
  address: string;             // Short address
  formatted_address: string;   // Full formatted address
  formatted_phone_number?: string;     // Formatted phone number for display
  international_phone_number?: string; // International format phone number
  website?: string;            // Official website URL
  url?: string;                // Google Maps URL
  rating?: number;             // Average rating (0-5)
  user_ratings_total?: number; // Number of user ratings
  price_level?: number;        // Price level (1-4, where 1 is least expensive)
  opening_hours?: {            // Operating hours information
    open_now?: boolean;        // Whether the place is currently open
    periods?: {                // Opening periods for each day of the week
      open: {                  // Opening time
        day: number;           // Day of week (0=Sunday, 6=Saturday)
        time: string;          // Opening time (24hr format, e.g. "0900")
      };
      close: {                 // Closing time
        day: number;           // Day of week (0=Sunday, 6=Saturday)
        time: string;          // Closing time (24hr format, e.g. "2100")
      };
    }[];
    weekday_text?: string[];   // Human-readable operating hours
  };
  photos?: string[];           // Array of photo URLs
  reviews?: {                  // User reviews
    author_name: string;       // Name of the reviewer
    author_url?: string;       // URL to the reviewer's profile
    profile_photo_url?: string; // URL to the reviewer's profile photo
    rating: number;            // Rating given by the reviewer (1-5)
    relative_time_description: string; // Relative time of the review (e.g., "a month ago")
    text: string;              // Review text
    time: number;              // Timestamp of the review
  }[];
  types?: string[];            // Array of place types
  category: {                  // Emoji Map category
    key: number;               // Category ID
    emoji: string;             // Emoji representation of the category
    name: string;              // Category name
  };
}
{% /code %}

#### Example Response

{% code language="json" title="Example Response" %}
{
  "data": {
    "id": "ChIJgVvTYZNYwokRRcOYJq4rJoo",
    "name": "Joe's Pizza",
    "location": {
      "lat": 40.7308838,
      "lng": -73.9973379
    },
    "address": "7 Carmine St, New York, NY 10014, USA",
    "formatted_address": "7 Carmine St, New York, NY 10014, USA",
    "formatted_phone_number": "(212) 366-1182",
    "international_phone_number": "+1 212-366-1182",
    "website": "http://www.joespizzanyc.com/",
    "url": "https://maps.google.com/?cid=12720161895798730026",
    "rating": 4.7,
    "user_ratings_total": 5612,
    "price_level": 1,
    "opening_hours": {
      "open_now": true,
      "periods": [
        {
          "open": {
            "day": 0,
            "time": "1000"
          },
          "close": {
            "day": 0,
            "time": "2200"
          }
        },
        // More periods...
      ],
      "weekday_text": [
        "Monday: 10:00 AM – 10:00 PM",
        "Tuesday: 10:00 AM – 10:00 PM",
        "Wednesday: 10:00 AM – 10:00 PM",
        "Thursday: 10:00 AM – 10:00 PM",
        "Friday: 10:00 AM – 11:00 PM",
        "Saturday: 10:00 AM – 11:00 PM",
        "Sunday: 10:00 AM – 10:00 PM"
      ]
    },
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photoreference=...",
      // More photos...
    ],
    "reviews": [
      {
        "author_name": "John Smith",
        "author_url": "https://www.google.com/maps/contrib/...",
        "profile_photo_url": "https://lh3.googleusercontent.com/a-/...",
        "rating": 5,
        "relative_time_description": "a month ago",
        "text": "Best pizza in NYC! The classic slice is perfect - thin, crispy crust with the perfect ratio of sauce to cheese.",
        "time": 1613456789
      },
      // More reviews...
    ],
    "types": [
      "restaurant",
      "food",
      "point_of_interest",
      "establishment"
    ],
    "category": {
      "key": 13,
      "emoji": "🍕",
      "name": "Pizza"
    }
  },
  "cacheHit": true,
  "count": 1
}
{% /code %}
{% /response %}

{% response status=400 description="Bad request" %}
Returned when the request parameters are invalid or missing required fields.

#### Common Error Cases
- Missing ID parameter
- Invalid ID format

{% code language="json" title="Example Error Response" %}
{
  "error": "ID is required"
}
{% /code %}
{% /response %}

{% response status=404 description="Not found" %}
Returned when the specified place is not found in the database or the Google Places API.

{% code language="json" title="Example Error Response" %}
{
  "error": "Place not found"
}
{% /code %}
{% /response %}

{% response status=500 description="Server error" %}
Returned when there's an error processing the request or communicating with the underlying services.

{% code language="json" title="Example Error Response" %}
{
  "error": "Failed to fetch place details from Google API."
}
{% /code %}
{% /response %}

### Examples

#### Basic Usage

{% code language="typescript" title="Basic Request" %}
// Fetch details for a specific place
const response = await fetch('/api/places/details?id=ChIJN1t_tDeuEmsRUsoyG83frY4');
const result = await response.json();

// Access the place details from the data property
const placeDetails = result.data;
console.log(`Retrieved details for ${placeDetails.name} (cache hit: ${result.cacheHit})`);

// Use the place details
displayPlaceInfo(placeDetails);
{% /code %}

#### Advanced Usage

{% code language="typescript" title="Advanced Request with Error Handling" %}
async function getPlaceDetails(placeId) {
  try {
    const url = new URL('/api/places/details', window.location.origin);
    url.searchParams.append('id', placeId);
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorData = await response.json();
      
      if (response.status === 404) {
        console.warn(`Place with ID ${placeId} not found`);
        return null;
      }
      
      throw new Error(errorData.error || `HTTP error ${response.status}`);
    }
    
    const result = await response.json();
    return {
      place: result.data,
      fromCache: result.cacheHit
    };
  } catch (error) {
    console.error('Error fetching place details:', error);
    throw error;
  }
}

// Usage
try {
  const placeId = 'ChIJgVvTYZNYwokRRcOYJq4rJoo';
  const { place, fromCache } = await getPlaceDetails(placeId);
  
  console.log(`Retrieved place details from cache: ${fromCache}`);
  
  if (place) {
    // Display place information
    displayPlaceName(place.name);
    displayAddress(place.formatted_address);
    displayRating(place.rating, place.user_ratings_total);
    
    if (place.opening_hours) {
      displayOpeningHours(place.opening_hours.weekday_text);
      displayOpenStatus(place.opening_hours.open_now);
    }
    
    if (place.photos && place.photos.length > 0) {
      displayPhotos(place.photos);
    }
  }
} catch (error) {
  // Handle error
  showErrorMessage('Failed to load place details');
}
{% /code %}

### Implementation Notes

- The API uses caching to improve performance and reduce load on the Google Places API
- Results are enriched with our emoji categorization system
- The response includes all available fields from the Google Places API, but some fields may be null or undefined if the data is not available
- For optimal performance, only request details for places that users are actively viewing
- The `cacheHit` property indicates whether the response was served from our cache

{% /endpoint %} 