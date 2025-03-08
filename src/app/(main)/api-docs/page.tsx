'use client';

import React, { Suspense, useEffect, useState } from 'react';
import SwaggerUIWrapper from './SwaggerUIWrapper';
import { ErrorBoundary } from '@/src/components/error-boundary/ErrorBoundary';
import { LoadingDocs } from './LoadingDocs';

export default function ApiDocs() {
  const [spec, setSpec] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch the OpenAPI spec from our API
    setIsLoading(true);
    fetch('/api/docs')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        // Ensure the data is properly formatted
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid API documentation format');
        }

        // Log the spec for debugging
        console.log('API Spec loaded successfully');

        setSpec(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error loading API docs:', error);
        setError(error instanceof Error ? error : new Error(String(error)));
        setIsLoading(false);
      });
  }, []);

  // Custom error UI outside of the ErrorBoundary for fetch errors
  if (error) {
    return (
      <>
        <div className='p-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md m-8'>
          <h2 className='text-xl font-bold text-red-700 dark:text-red-400 mb-2'>
            Failed to load API documentation
          </h2>
          <p className='text-red-600 dark:text-red-300 mb-4'>
            There was an error fetching the API documentation.
          </p>
          <details className='bg-white dark:bg-gray-800 p-4 rounded border border-red-100 dark:border-red-800'>
            <summary className='cursor-pointer font-medium'>
              Error details
            </summary>
            <pre className='mt-2 text-sm overflow-auto p-2 bg-gray-50 dark:bg-gray-900'>
              {error.message}
            </pre>
          </details>
          <button
            className='mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors'
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </>
    );
  }

  if (isLoading || !spec) {
    return <LoadingDocs />;
  }

  return (
    <>
      <div className='swagger-container pt-4'>
        <ErrorBoundary>
          <Suspense fallback={<LoadingDocs />}>
            <SwaggerUIWrapper spec={spec} />
          </Suspense>
        </ErrorBoundary>
        <style jsx global>{`
          /* Base Swagger UI styles */
          .swagger-ui .topbar {
            display: none;
          }
          .swagger-container {
            margin: 0;
            padding: 0;
          }
          .swagger-ui {
            margin-top: 20px;
          }
          .swagger-ui .info {
            margin: 30px 0;
          }
          .swagger-ui .scheme-container {
            padding: 15px 0;
            background-color: transparent;
            box-shadow: none;
          }

          /* Improve interaction with endpoints */
          .swagger-ui .opblock-tag {
            cursor: pointer;
            padding: 10px;
            transition: all 0.3s ease;
          }

          .swagger-ui .opblock-tag:hover {
            background-color: rgba(0, 0, 0, 0.05);
          }

          .swagger-ui .opblock {
            margin-bottom: 15px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
          }

          .swagger-ui .opblock:hover {
            box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
          }

          .swagger-ui .opblock-summary {
            cursor: pointer;
          }

          .swagger-ui .try-out__btn {
            background-color: #4a90e2 !important;
            color: white !important;
          }

          /* Dark mode improvements */
          .swagger-dark-theme .swagger-ui {
            color: #e4e4e7; /* zinc-200 */
          }

          /* Improve text contrast in dark mode */
          .swagger-dark-theme .swagger-ui .info .title,
          .swagger-dark-theme .swagger-ui .opblock-tag,
          .swagger-dark-theme
            .swagger-ui
            .opblock
            .opblock-summary-operation-id,
          .swagger-dark-theme .swagger-ui .opblock .opblock-summary-path,
          .swagger-dark-theme
            .swagger-ui
            .opblock
            .opblock-summary-path__deprecated,
          .swagger-dark-theme .swagger-ui .opblock .opblock-summary-description,
          .swagger-dark-theme .swagger-ui .model-title,
          .swagger-dark-theme .swagger-ui .models-control,
          .swagger-dark-theme .swagger-ui table thead tr th,
          .swagger-dark-theme .swagger-ui .parameters-col_description p,
          .swagger-dark-theme .swagger-ui .response-col_description p,
          .swagger-dark-theme .swagger-ui section.models h4,
          .swagger-dark-theme .swagger-ui .model-box,
          .swagger-dark-theme .swagger-ui .responses-inner h4,
          .swagger-dark-theme .swagger-ui .responses-inner h5,
          .swagger-dark-theme .swagger-ui .parameter__name,
          .swagger-dark-theme .swagger-ui .parameter__type,
          .swagger-dark-theme .swagger-ui .parameter__deprecated,
          .swagger-dark-theme .swagger-ui .parameter__in,
          .swagger-dark-theme .swagger-ui .parameter__extension,
          .swagger-dark-theme .swagger-ui label,
          .swagger-dark-theme .swagger-ui .tab li,
          .swagger-dark-theme .swagger-ui .opblock-description-wrapper p,
          .swagger-dark-theme .swagger-ui .opblock-external-docs-wrapper p,
          .swagger-dark-theme .swagger-ui .opblock-title_normal p,
          .swagger-dark-theme .swagger-ui .response-col_status,
          .swagger-dark-theme .swagger-ui .renderedMarkdown p {
            color: #e4e4e7 !important; /* zinc-200 */
          }

          /* Improve background colors in dark mode */
          .swagger-dark-theme .swagger-ui .opblock-tag,
          .swagger-dark-theme .swagger-ui .opblock,
          .swagger-dark-theme .swagger-ui .model-box,
          .swagger-dark-theme .swagger-ui section.models,
          .swagger-dark-theme .swagger-ui .scheme-container,
          .swagger-dark-theme .swagger-ui .servers-title,
          .swagger-dark-theme .swagger-ui .servers > label,
          .swagger-dark-theme .swagger-ui .servers > select {
            background-color: #27272a !important; /* zinc-800 */
            border-color: #3f3f46 !important; /* zinc-700 */
          }

          /* Improve input fields in dark mode */
          .swagger-dark-theme .swagger-ui input,
          .swagger-dark-theme .swagger-ui select,
          .swagger-dark-theme .swagger-ui textarea {
            background-color: #18181b !important; /* zinc-900 */
            color: #e4e4e7 !important; /* zinc-200 */
            border-color: #3f3f46 !important; /* zinc-700 */
          }

          /* Improve buttons in dark mode */
          .swagger-dark-theme .swagger-ui .btn {
            background-color: #3f3f46 !important; /* zinc-700 */
            color: #e4e4e7 !important; /* zinc-200 */
            border-color: #52525b !important; /* zinc-600 */
          }

          /* Improve code blocks in dark mode */
          .swagger-dark-theme .swagger-ui .microlight {
            background-color: #18181b !important; /* zinc-900 */
            color: #e4e4e7 !important; /* zinc-200 */
            border-color: #3f3f46 !important; /* zinc-700 */
          }

          /* Improve table styles in dark mode */
          .swagger-dark-theme .swagger-ui table {
            background-color: #27272a !important; /* zinc-800 */
            color: #e4e4e7 !important; /* zinc-200 */
          }

          .swagger-dark-theme .swagger-ui table tbody tr td {
            background-color: #27272a !important; /* zinc-800 */
            color: #e4e4e7 !important; /* zinc-200 */
            border-color: #3f3f46 !important; /* zinc-700 */
          }

          /* Improve links in dark mode */
          .swagger-dark-theme .swagger-ui a {
            color: #93c5fd !important; /* blue-300 */
          }

          .swagger-dark-theme .swagger-ui a:hover {
            color: #bfdbfe !important; /* blue-200 */
          }

          /* Improve method badges in dark mode */
          .swagger-dark-theme .swagger-ui .opblock-summary-method {
            background-color: #1e40af !important; /* blue-800 */
            color: #ffffff !important;
          }

          .swagger-dark-theme .swagger-ui .opblock.opblock-get {
            border-color: #1e40af !important; /* blue-800 */
            background-color: rgba(30, 64, 175, 0.1) !important;
          }

          .swagger-dark-theme .swagger-ui .opblock.opblock-post {
            border-color: #15803d !important; /* green-800 */
            background-color: rgba(21, 128, 61, 0.1) !important;
          }

          .swagger-dark-theme .swagger-ui .opblock.opblock-put {
            border-color: #9a3412 !important; /* amber-800 */
            background-color: rgba(154, 52, 18, 0.1) !important;
          }

          .swagger-dark-theme .swagger-ui .opblock.opblock-delete {
            border-color: #b91c1c !important; /* red-800 */
            background-color: rgba(185, 28, 28, 0.1) !important;
          }

          /* Improve response sections in dark mode */
          .swagger-dark-theme .swagger-ui .responses-table {
            background-color: #27272a !important; /* zinc-800 */
          }

          .swagger-dark-theme .swagger-ui .response-col_status {
            font-weight: bold;
          }

          /* Improve tabs in dark mode */
          .swagger-dark-theme .swagger-ui .tab li {
            background-color: #3f3f46 !important; /* zinc-700 */
          }

          .swagger-dark-theme .swagger-ui .tab li.active {
            background-color: #52525b !important; /* zinc-600 */
          }

          /* Improve dropdown selects in dark mode */
          .swagger-dark-theme .swagger-ui select {
            background-color: #27272a !important; /* zinc-800 */
            color: #e4e4e7 !important; /* zinc-200 */
            border-color: #3f3f46 !important; /* zinc-700 */
          }

          /* Improve schema sections in dark mode */
          .swagger-dark-theme .swagger-ui .model-toggle:after {
            background-color: #3f3f46 !important; /* zinc-700 */
          }
        `}</style>
      </div>
    </>
  );
}
