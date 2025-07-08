import { loadEsm } from 'load-esm';

// Define module type for better type safety and to avoid repetition
export type OpenAuthSubjectModule =
  typeof import('@openauthjs/openauth/subject');
export type OpenAuthClientModule = typeof import('@openauthjs/openauth/client');

// Cache loaded modules
const cachedModules: {
  subject?: OpenAuthSubjectModule;
  client?: OpenAuthClientModule;
} = {};

// Create a promise cache to ensure parallel calls wait for the same loading operation
const loadingPromises: {
  subject?: Promise<OpenAuthSubjectModule>;
  client?: Promise<OpenAuthClientModule>;
} = {};

/**
 * Load OpenAuth modules efficiently with promise caching
 * to prevent duplicate loading requests
 */
export const loadOpenAuth = async () => {
  // Load subject module if not already cached
  if (!cachedModules.subject) {
    if (!loadingPromises.subject) {
      loadingPromises.subject = loadEsm<OpenAuthSubjectModule>(
        '@openauthjs/openauth/subject',
      );
    }
    cachedModules.subject = await loadingPromises.subject;
  }

  // Load client module if not already cached
  if (!cachedModules.client) {
    if (!loadingPromises.client) {
      loadingPromises.client = loadEsm<OpenAuthClientModule>(
        '@openauthjs/openauth/client',
      );
    }
    cachedModules.client = await loadingPromises.client;
  }

  // Return the required functions
  return {
    createClient: cachedModules.client.createClient,
    createSubjects: cachedModules.subject.createSubjects,
  };
};

/**
 * Get the cached modules for debugging purposes
 */
export const getCachedModules = () => {
  return { ...cachedModules };
};
