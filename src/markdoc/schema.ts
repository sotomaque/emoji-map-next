import type { Config } from '@markdoc/markdoc';

/**
 * Markdoc schema for custom components and tags
 *
 * This schema defines custom components and tags that can be used in Markdoc files
 * to create rich API documentation.
 */
const schema: Config = {
  tags: {
    callout: {
      render: 'Callout',
      attributes: {
        type: {
          type: String,
          default: 'note',
          matches: ['note', 'warning', 'error', 'success', 'info'],
        },
        title: {
          type: String,
        },
      },
    },
    endpoint: {
      render: 'Endpoint',
      attributes: {
        method: {
          type: String,
          required: true,
          matches: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        },
        path: {
          type: String,
          required: true,
        },
        description: {
          type: String,
        },
      },
    },
    param: {
      render: 'Parameter',
      attributes: {
        name: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          required: true,
        },
        required: {
          type: Boolean,
          default: false,
        },
        description: {
          type: String,
        },
      },
    },
    response: {
      render: 'Response',
      attributes: {
        status: {
          type: Number,
          required: true,
        },
        description: {
          type: String,
        },
      },
    },
    code: {
      render: 'CodeBlock',
      attributes: {
        language: {
          type: String,
          default: 'typescript',
        },
        title: {
          type: String,
        },
      },
    },
  },
};

export default schema;
