import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import Markdoc from '@markdoc/markdoc';
import { ArrowLeft, } from 'lucide-react';
import * as MarkdocComponents from '@/components/markdoc';
import schema from '@/markdoc/schema';
import type { Metadata } from 'next';

interface ApiDocsPageProps {
  params: {
    slug: string[];
  };
}


/**
 * Generate metadata for the API documentation page
 * 
 * @param {ApiDocsPageProps} props - Page props
 * @returns {Metadata} Page metadata
 */
export function generateMetadata({ params }: ApiDocsPageProps): Metadata {
  const { slug } = params;
  const title = slug.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');

  return {
    title: `Emoji Map | ${title} API`,
    description: `API documentation for Emoji Map ${title}`,
  };
}

/**
 * Dynamic API Documentation page that renders Markdoc content based on the slug
 * 
 * @param {ApiDocsPageProps} props - Page props
 * @returns {JSX.Element} API Documentation page
 */
export default function ApiDocsSlugPage({ params }: ApiDocsPageProps) {
  const { slug } = params;
  const filePath = join(process.cwd(), 'src/markdoc/api', ...slug, 'index.md');

  // Check if the file exists
  if (!existsSync(filePath)) {
    notFound();
  }

  // Read the Markdoc content from the file
  const content = readFileSync(filePath, 'utf-8');

  // Parse the Markdoc content
  const ast = Markdoc.parse(content);

  // Transform the AST using our schema
  const content_ast = Markdoc.transform(ast, schema);

  // Render the content with our components
  const children = Markdoc.renderers.react(content_ast, React, {
    components: {
      Callout: MarkdocComponents.Callout,
      CodeBlock: MarkdocComponents.CodeBlock,
      Endpoint: MarkdocComponents.Endpoint,
      Parameter: MarkdocComponents.Parameter,
      Response: MarkdocComponents.Response,
    },
  });

  return (
    <div className="bg-gradient-to-b from-background to-muted/20 min-h-screen">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Back to docs link */}
        <Link
          href="/docs"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to API Documentation
        </Link>

        {/* Main content with improved styling */}
        <div className="bg-card rounded-lg border border-border shadow-sm p-8">
          <div className="prose prose-cyan dark:prose-invert max-w-none">
            {children}
          </div>
        </div>

        {/* Related documentation links */}
        <div className="mt-12">
          <h3 className="text-lg font-semibold mb-4">Related Documentation</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {slug[0] === 'places' && (
              <>
                {slug[1] !== 'nearby' && (
                  <Link
                    href="/docs/api/places/nearby"
                    className="p-4 bg-card rounded-lg border border-border hover:shadow-md transition-all"
                  >
                    <h4 className="font-medium mb-2">Nearby Places API</h4>
                    <p className="text-sm text-muted-foreground">
                      Search for places near a specific location
                    </p>
                  </Link>
                )}
                {slug[1] !== 'details' && (
                  <Link
                    href="/docs/api/places/details"
                    className="p-4 bg-card rounded-lg border border-border hover:shadow-md transition-all"
                  >
                    <h4 className="font-medium mb-2">Place Details API</h4>
                    <p className="text-sm text-muted-foreground">
                      Get detailed information about a specific place
                    </p>
                  </Link>
                )}
                {slug[1] !== 'photos' && (
                  <Link
                    href="/docs/api/places/photos"
                    className="p-4 bg-card rounded-lg border border-border hover:shadow-md transition-all"
                  >
                    <h4 className="font-medium mb-2">Place Photos API</h4>
                    <p className="text-sm text-muted-foreground">
                      Retrieve photos for a specific place
                    </p>
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 