# Place Photos API

The Place Photos API allows you to retrieve high-quality photos for a specific place. This endpoint is perfect for enhancing your application with visual content for places, making listings more engaging and informative.

{% callout type="info" %}
This API uses the Google Places API under the hood to fetch photos and returns optimized URLs that can be directly used in your application.
{% /callout %}

## Implementation Details

The Place Photos API:
- Accepts a place ID and optional parameters for photo retrieval
- Fetches photo references from Google Places API
- Generates optimized photo URLs with appropriate sizing
- Handles caching to improve performance and reduce API costs
- Supports limiting the number of photos returned

## Use Cases

- **Place galleries**: Display multiple photos of a place in a gallery or carousel
- **Place listings**: Enhance place listings with representative images
- **Detail pages**: Show high-quality photos on place detail pages
- **Visual search results**: Include photos in search results to improve user engagement

## Endpoints

{% endpoint method="GET" path="/api/places/photos" description="Get photos for a specific place" %}

### Query Parameters

{% param name="id" type="string" required=true description="The unique identifier of the place" %}
The Google Places ID for the place. This is typically obtained from the Nearby Places API or Place Details API response.

**Example**: `ChIJgVvTYZNYwokRRcOYJq4rJoo` for Joe's Pizza in New York
{% /param %}

{% param name="limit" type="number" description="Maximum number of photos to return (default: 5)" %}
Controls the number of photos returned by the API. The API will return at most this many photos.

**Default**: 5  
**Note**: Higher limits may increase response time and data transfer.
{% /param %}

{% param name="maxheight" type="number" description="Maximum height of the photos in pixels (default: 1600, max: 4000)" %}
Controls the maximum height of the returned photos. The API will return photos with a maximum height of this value.

**Default**: 1600 pixels  
**Maximum**: 4000 pixels

**Note**: Higher resolution photos will have larger file sizes. Choose an appropriate size for your application's needs.
{% /param %}

### Response Structure

{% response status=200 description="Successful response" %}
Returns a cached response containing an array of photo URLs for the specified place.

{% code language="typescript" title="Response Structure" %}
// The main response type
interface PlacePhotosResponse {
  data: string[];      // Array of photo URLs
  cacheHit: boolean;   // Whether the response was served from cache
  count: number;       // Number of photos returned
}
{% /code %}

#### Example Response

{% code language="json" title="Example Response" %}
{
  "data": [
    "https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photoreference=Aap_uEDMqQQzKgILQCgHjIldZP...",
    "https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photoreference=Aap_uECyqK3IZTJvtFYpDjH6Vgx...",
    "https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photoreference=Aap_uEAGqJLNYZ9wBZYc4LQv3hF..."
  ],
  "cacheHit": false,
  "count": 3
}
{% /code %}
{% /response %}

{% response status=400 description="Bad request" %}
Returned when the request parameters are invalid or missing required fields.

#### Common Error Cases
- Missing ID parameter
- Invalid ID format
- Invalid limit or maxheight values

{% code language="json" title="Example Error Response" %}
{
  "error": "ID is required"
}
{% /code %}
{% /response %}

{% response status=404 description="Not found" %}
Returned when the specified place is not found or has no photos available.

{% code language="json" title="Example Error Response" %}
{
  "error": "No photos found for this place"
}
{% /code %}
{% /response %}

{% response status=500 description="Server error" %}
Returned when there's an error processing the request or communicating with the underlying services.

{% code language="json" title="Example Error Response" %}
{
  "error": "Failed to fetch photos from Google API."
}
{% /code %}
{% /response %}

### Examples

#### Basic Usage

{% code language="typescript" title="Basic Request" %}
// Fetch photos for a specific place
const response = await fetch('/api/places/photos?id=ChIJN1t_tDeuEmsRUsoyG83frY4&limit=3');
const result = await response.json();

// Access the photos array from the data property
const photos = result.data;
console.log(`Retrieved ${result.count} photos for the place (cache hit: ${result.cacheHit})`);

// Use the photos
displayPhotoGallery(photos);
{% /code %}

#### Advanced Usage

{% code language="typescript" title="Advanced Request with Image Gallery" %}
async function getPlacePhotos(placeId, options = {}) {
  const { limit = 5, maxheight = 1600 } = options;
  
  try {
    const url = new URL('/api/places/photos', window.location.origin);
    url.searchParams.append('id', placeId);
    url.searchParams.append('limit', limit.toString());
    url.searchParams.append('maxheight', maxheight.toString());
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorData = await response.json();
      
      if (response.status === 404) {
        console.warn(`No photos found for place with ID ${placeId}`);
        return { photos: [], fromCache: false };
      }
      
      throw new Error(errorData.error || `HTTP error ${response.status}`);
    }
    
    const result = await response.json();
    return {
      photos: result.data,
      count: result.count,
      fromCache: result.cacheHit
    };
  } catch (error) {
    console.error('Error fetching place photos:', error);
    throw error;
  }
}

// Usage in a photo gallery component
async function loadPhotoGallery(placeId) {
  try {
    const galleryElement = document.getElementById('place-gallery');
    galleryElement.innerHTML = '<div class="loading">Loading photos...</div>';
    
    const { photos, count, fromCache } = await getPlacePhotos(placeId, { limit: 10 });
    
    console.log(`Retrieved ${count} photos (from cache: ${fromCache})`);
    
    if (photos.length === 0) {
      galleryElement.innerHTML = '<div class="no-photos">No photos available</div>';
      return;
    }
    
    // Create gallery HTML
    const galleryHTML = photos.map(photoUrl => `
      <div class="gallery-item">
        <img src="${photoUrl}" alt="Place photo" loading="lazy" />
      </div>
    `).join('');
    
    galleryElement.innerHTML = galleryHTML;
    
    // Initialize gallery functionality (e.g., lightbox, carousel)
    initializeGallery(galleryElement);
  } catch (error) {
    document.getElementById('place-gallery').innerHTML = 
      '<div class="error">Failed to load photos</div>';
  }
}
{% /code %}

### Implementation Notes

- The API uses caching to improve performance and reduce load on the Google Places API
- Photo URLs are temporary and may expire after a certain period
- For optimal performance and user experience, use appropriate image sizes and lazy loading
- The API returns a limited number of photos even if more are available from Google
- Consider implementing a lightbox or gallery component for displaying multiple photos
- The `cacheHit` property indicates whether the response was served from our cache

{% /endpoint %} 