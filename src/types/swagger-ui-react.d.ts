declare module 'swagger-ui-react' {
  import { ComponentType } from 'react';

  interface SwaggerUIProps {
    spec: Record<string, unknown>;
    url?: string;
    layout?: string;
    docExpansion?: 'list' | 'full' | 'none';
    defaultModelsExpandDepth?: number;
    defaultModelExpandDepth?: number;
    showExtensions?: boolean;
    showCommonExtensions?: boolean;
    filter?: boolean | string;
    validatorUrl?: string | null;
    onComplete?: () => void;
    requestInterceptor?: (req: unknown) => unknown;
    responseInterceptor?: (res: unknown) => unknown;
    withCredentials?: boolean;
    supportedSubmitMethods?: string[];
    presets?: unknown[];
    plugins?: unknown[];
    displayOperationId?: boolean;
    deepLinking?: boolean;
    displayRequestDuration?: boolean;
    tryItOutEnabled?: boolean;
    oauth2RedirectUrl?: string;
    tagsSorter?: (a: string, b: string) => number;
    operationsSorter?: (a: unknown, b: unknown) => number;
    showMutatedRequest?: boolean;
    persistAuthorization?: boolean;
  }

  const SwaggerUI: ComponentType<SwaggerUIProps>;

  export default SwaggerUI;
}

declare module 'swagger-ui-react/swagger-ui.css';
