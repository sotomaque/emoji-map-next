# Emoji Map Web App

<div align="center">
  <img src="public/logo.png" alt="Emoji Map Logo" width="180" height="180" style="border-radius: 12px; margin-bottom: 20px;" />
  <h3>Find places on a map with emoji markers</h3>
  
  <div style="margin-top: 20px;">
    <a href="https://github.com/sotomaque/emoji-map-next">
      <img src="https://img.shields.io/badge/GitHub-Web_App-blue?style=for-the-badge&logo=github" alt="Web App Repository" />
    </a>
    <a href="https://github.com/sotomaque/emoji-map">
      <img src="https://img.shields.io/badge/GitHub-iOS_App-purple?style=for-the-badge&logo=github" alt="iOS App Repository" />
    </a>
  </div>
</div>

A Next.js web application that displays places on a map using emoji markers. This web app is the companion to the [iOS Emoji Map app](https://github.com/sotomaque/emoji-map), providing the same functionality in a web interface. Both applications use the Google Places API to fetch location data and display it on an interactive map.

## Features

- 🗺️ Interactive Google Maps integration with custom emoji markers
- 🍔 Category-based place search with emoji markers
- 🔍 Search for places near your current location
- ⭐ View place details including ratings, photos, and reviews
- 🌙 Dark mode support
- 📱 Responsive design for mobile and desktop
- 📚 Interactive API documentation with Swagger UI
- 🔄 State management with Zustand for filters and preferences
- 📊 Marker clustering for improved map performance
- 🧪 Comprehensive test suite with 95%+ coverage

## Tech Stack

- [Next.js 15](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Google Maps API](https://developers.google.com/maps) - Maps and location services
- [Google Places API](https://developers.google.com/maps/documentation/places/web-service) - Place data
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Zustand](https://github.com/pmndrs/zustand) - State management
- [@react-google-maps/api](https://github.com/JustFly1984/react-google-maps-api) - Google Maps React components
- [@t3-oss/env-nextjs](https://github.com/t3-oss/env-nextjs) - Type-safe environment variables
- [next-swagger-doc](https://github.com/atomicpages/next-swagger-doc) - OpenAPI documentation
- [Swagger UI](https://swagger.io/tools/swagger-ui/) - Interactive API documentation
- [Vitest](https://vitest.dev/) - Testing framework
- [MSW](https://mswjs.io/) - API mocking for tests
- [React Query](https://tanstack.com/query/latest) - Data fetching and caching

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Google Maps API key with Places API enabled

### Environment Variables

Create a `.env.local` file in the root of the web directory with the following variables:

```
# Google Maps API Key (for client-side use)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here

# Google Places API Key (for server-side use)
GOOGLE_PLACES_API_KEY=your_api_key_here

# Google Places API URLs
GOOGLE_PLACES_URL=https://maps.googleapis.com/maps/api/place/nearbysearch/json
GOOGLE_PLACES_DETAILS_URL=https://maps.googleapis.com/maps/api/place/details/json
GOOGLE_PLACES_PHOTO_URL=https://maps.googleapis.com/maps/api/place/photo

# Optional: Mapbox token if using Mapbox maps
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```

> **Note:** The application uses type-safe environment variables with `@t3-oss/env-nextjs`. If any required environment variables are missing, the build will fail with a clear error message.

### Installation

```bash
# Install dependencies
pnpm install

# Run the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Available Scripts

```bash
# Development
pnpm dev           # Start the development server
pnpm build         # Build the application for production
pnpm start         # Start the production server

# Code Quality
pnpm lint          # Run ESLint to check for issues
pnpm lint:fix      # Run ESLint and automatically fix issues
pnpm format        # Run Prettier to format all files
pnpm format:check  # Check if files are properly formatted
pnpm precheck      # Run format, lint:fix, and type checking

# Testing
pnpm test          # Run all tests
pnpm test:watch    # Run tests in watch mode
pnpm test:ui       # Run tests with UI
pnpm test:coverage # Run tests with coverage report
```

## API Documentation

The API is documented using OpenAPI (Swagger) specification. You can access the interactive API documentation at:

```
http://localhost:3000/api-docs
```

This documentation provides:

- Detailed information about all available endpoints
- Request parameters and their types
- Response schemas
- Example requests and responses
- Interactive "Try it out" functionality to test the API directly from the browser

The API specification is also available in JSON format at:

```
http://localhost:3000/api/docs
```

This can be imported into API client tools like Postman or used by other applications to generate client code.

## API Routes

### `/api/places/nearby`

Fetches nearby places based on location and category.

**Parameters:**

- `location` (required): Latitude and longitude in format "lat,lng"
- `radius` (optional): Search radius in meters (default: 5000)
- `type` (required): Google Places type (e.g., "restaurant", "cafe")
- `keyword` (optional): Specific keyword to search for
- `category` (optional): Category name to assign to results
- `openNow` (optional): Set to "true" to only show places that are currently open

**Example:**

```
/api/places/nearby?location=37.7749,-122.4194&radius=5000&type=restaurant&keyword=burger&category=burger&openNow=true
```

### `/api/places/details`

Fetches details for a specific place.

**Parameters:**

- `placeId` (required): The Google Places ID of the place

**Example:**

```
/api/places/details?placeId=ChIJN1t_tDeuEmsRUsoyG83frY4
```

## Project Structure

```
web/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── docs/
│   │   │   │   └── route.ts
│   │   │   ├── health/
│   │   │   │   └── route.ts
│   │   │   ├── places/
│   │   │   │   ├── nearby/
│   │   │   │   │   └── route.ts
│   │   │   │   └── details/
│   │   │   │       └── route.ts
│   │   ├── api-docs/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── map/
│   │   │   ├── GoogleMap.tsx
│   │   │   └── EmojiMarker.tsx
│   │   ├── nav/
│   │   ├── ui/
│   │   └── providers/
│   ├── constants/
│   ├── hooks/
│   │   ├── usePlaces.ts
│   │   └── useCurrentLocation.ts
│   ├── services/
│   │   └── places.ts
│   ├── store/
│   │   └── useFiltersStore.ts
│   ├── lib/
│   │   └── swagger.ts
│   ├── test/
│   │   ├── api/
│   │   │   ├── health/
│   │   │   ├── places/
│   │   ├── services/
│   │   │   ├── places.test.ts
│   │   │   └── hooks.test.tsx
│   │   ├── store/
│   │   │   └── useFiltersStore.test.ts
│   │   ├── examples/
│   │   ├── mocks/
│   │   ├── setup.ts
│   │   └── utils.tsx
│   ├── types/
│   │   ├── google-places.ts
│   │   └── nav-items.ts
│   └── env.ts
├── public/
├── .env.local
├── next.config.ts
├── vitest.config.ts
├── eslint.config.mjs
├── tailwind.config.ts
└── package.json
```

## Testing

This project uses Vitest for unit and API testing. The test setup includes:

- Unit tests for React components
- API route tests for direct testing of API handlers
- Integration tests using MSW (Mock Service Worker) for API mocking
- Test utilities for common testing patterns
- Service tests for data fetching and transformation
- Hook tests for custom React hooks
- Store tests for Zustand state management

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with UI
pnpm test:ui

# Run tests with coverage
pnpm test:coverage
```

### Test Structure

- `src/test/setup.ts`: Global test setup and utilities
- `src/test/utils.tsx`: React testing utilities
- `src/test/api/`: API route tests
- `src/test/services/`: Service and hook tests
- `src/test/store/`: State management tests
- `src/test/examples/`: Example tests for reference
- `src/test/mocks/`: Mock data and services

### API Tests

The API tests cover:

- Health endpoint (`/api/health`)
- Places nearby endpoint (`/api/places/nearby`)
- Place details endpoint (`/api/places/details`)

Each API route is tested for:

- Success cases with valid parameters
- Error handling for missing parameters
- Error handling for API errors
- Edge cases specific to each endpoint

### Service and Hook Tests

The service and hook tests cover:

- Places service for fetching and transforming data
- Custom hooks for data fetching and geolocation
- Error handling and edge cases
- React Query integration

### State Management Tests

The state management tests cover:

- Zustand store initialization
- Action creators and reducers
- State updates and selectors
- Integration with React components

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Emoji Map iOS app for the original concept
- Google Maps and Places API for location data
- Next.js team for the amazing framework
- React Query and Zustand for state management solutions
