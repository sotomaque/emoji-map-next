import { createSwaggerSpec } from 'next-swagger-doc';

export const getApiDocs = () => {
  const spec = createSwaggerSpec({
    apiFolder: 'src/app/api',
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Emoji Map API Documentation',
        version: '1.0.0',
        description: 'Documentation for the Emoji Map API endpoints',
        contact: {
          name: 'API Support',
          email: 'support@example.com',
        },
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Local development server',
        },
        {
          url: 'https://emoji-map.vercel.app',
          description: 'Production server',
        },
      ],
      tags: [
        {
          name: 'places',
          description: 'Operations related to places',
        },
      ],
      components: {
        schemas: {
          Place: {
            type: 'object',
            properties: {
              placeId: {
                type: 'string',
                description: 'Unique identifier for the place',
              },
              name: {
                type: 'string',
                description: 'Name of the place',
              },
              coordinate: {
                type: 'object',
                properties: {
                  latitude: {
                    type: 'number',
                    format: 'float',
                    description: 'Latitude coordinate',
                  },
                  longitude: {
                    type: 'number',
                    format: 'float',
                    description: 'Longitude coordinate',
                  },
                },
              },
              category: {
                type: 'string',
                description: 'Category of the place',
              },
              description: {
                type: 'string',
                description: 'Description or address of the place',
              },
              priceLevel: {
                type: 'integer',
                description: 'Price level from 1 to 4',
                nullable: true,
              },
              openNow: {
                type: 'boolean',
                description: 'Whether the place is currently open',
                nullable: true,
              },
              rating: {
                type: 'number',
                format: 'float',
                description: 'Rating of the place',
                nullable: true,
              },
            },
          },
          PlaceDetails: {
            type: 'object',
            properties: {
              photos: {
                type: 'array',
                items: {
                  type: 'string',
                  description: 'URL to a photo of the place',
                },
              },
              reviews: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    author: {
                      type: 'string',
                      description: 'Name of the reviewer',
                    },
                    text: {
                      type: 'string',
                      description: 'Review text',
                    },
                    rating: {
                      type: 'integer',
                      description: 'Rating given by the reviewer',
                    },
                  },
                },
              },
            },
          },
          Error: {
            type: 'object',
            properties: {
              error: {
                type: 'string',
                description: 'Error message',
              },
            },
          },
        },
      },
    },
  });
  return spec;
};
