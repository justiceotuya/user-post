interface FrontendConfig {
  api: {
    url: string;
    prefix: string;
    baseUrl: string;
  };
  app: {
    title: string;
    version: string;
    description: string;
  };
  dev: {
    port: number;
    host: string;
  };
  features: {
    devTools: boolean;
    analytics: boolean;
  };
  logging: {
    level: string;
  };
}

const frontendConfig: FrontendConfig = {
  api: {
    url: import.meta.env.VITE_API_URL || 'http://localhost:5003',
    prefix: import.meta.env.VITE_API_PREFIX || '/api',
    get baseUrl() {
      return `${this.url}${this.prefix}`;
    }
  },
  app: {
    title: import.meta.env.VITE_APP_TITLE || 'User Post App',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    description: import.meta.env.VITE_APP_DESCRIPTION || 'A user and post management system',
  },
  dev: {
    port: parseInt(import.meta.env.VITE_DEV_PORT || '5173', 10),
    host: import.meta.env.VITE_DEV_HOST || 'localhost',
  },
  features: {
    devTools: import.meta.env.VITE_ENABLE_DEV_TOOLS === 'true',
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  },
  logging: {
    level: import.meta.env.VITE_LOG_LEVEL || 'info',
  },
};

console.log(`🔧 Frontend Config Loaded:
  - API Base URL: ${frontendConfig.api.baseUrl}
  - App Title: ${frontendConfig.app.title}
  - Dev Port: ${frontendConfig.dev.port}
  - Dev Tools: ${frontendConfig.features.devTools}`);

export default frontendConfig;
export type { FrontendConfig };
