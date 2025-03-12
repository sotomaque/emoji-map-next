import React from 'react';
import MarkdocLib from '@markdoc/markdoc';
import * as MarkdocComponents from '@/components/markdoc';
import schema from '@/markdoc/schema';

interface MarkdocProps {
  content: string;
}

/**
 * Markdoc component that renders Markdoc content
 *
 * @param {MarkdocProps} props - Component props
 * @returns {JSX.Element} Rendered Markdoc content
 */
export function Markdoc({ content }: MarkdocProps): React.ReactNode {
  // Parse the Markdoc content
  const ast = MarkdocLib.parse(content);

  // Transform the AST using our schema
  const content_ast = MarkdocLib.transform(ast, schema);

  // Render the content with our components
  const children = MarkdocLib.renderers.react(content_ast, React, {
    components: {
      Callout: MarkdocComponents.Callout,
      CodeBlock: MarkdocComponents.CodeBlock,
      Endpoint: MarkdocComponents.Endpoint,
      Parameter: MarkdocComponents.Parameter,
      Response: MarkdocComponents.Response,
    },
  });

  return <>{children}</>;
}
