'use client';

import { useEffect, useState } from 'react';
import { LoadingDocs } from './LoadingDocs';

export default function ApiDocsPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <LoadingDocs />;
  }

  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>API Documentation</h1>
      <p className='mb-4'>
        Swagger UI is temporarily disabled due to compatibility issues with the
        lodash-es optimization.
      </p>
      <p>
        Please check back later or contact the development team if you need
        access to the API documentation.
      </p>
    </div>
  );
}
