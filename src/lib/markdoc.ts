import React from 'react';
import Markdoc from '@markdoc/markdoc';
import * as MarkdocComponents from '@/components/markdoc';
import schema from '@/markdoc/schema';

/**
 * Parse Markdoc content into React elements
 *
 * @param content - Markdoc content to parse
 * @returns React elements
 */
export function parseMarkdoc(content: string) {
  // Parse the Markdoc content
  const ast = Markdoc.parse(content);

  // Transform the AST using our schema
  const content_ast = Markdoc.transform(ast, schema);

  // Render the content with our components
  return Markdoc.renderers.react(content_ast, React, {
    components: {
      Callout: MarkdocComponents.Callout,
      CodeBlock: MarkdocComponents.CodeBlock,
      Endpoint: MarkdocComponents.Endpoint,
      Parameter: MarkdocComponents.Parameter,
      Response: MarkdocComponents.Response,
    },
  });
}

/**
 * Read and parse a Markdoc file
 *
 * @param path - Path to the Markdoc file
 * @returns React elements
 */
export async function readMarkdocFile(path: string) {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to fetch Markdoc file: ${path}`);
    }
    const content = await response.text();
    return parseMarkdoc(content);
  } catch (error) {
    console.error('Error reading Markdoc file:', error);
    return null;
  }
}
