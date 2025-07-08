/**
 * This file provides a client for OpenAuth authentication
 * It uses the loader utility to properly import ESM modules in the CommonJS environment
 */

import { loadOpenAuth } from './openauth-loader.util';

// Track if initialization has started
let initStarted = false;
// Store the client instance once it's loaded
let openAuthClient: any = null;
// Store any error that occurred during initialization
let initError: Error | null = null;

/**
 * Initialize the OpenAuth client
 * This should be called early in the application startup
 */
export const initializeOpenAuthClient = async (
  issuer: string,
): Promise<void> => {
  if (initStarted) return;

  initStarted = true;

  try {
    // Load the OpenAuth modules
    const { createClient } = await loadOpenAuth();

    // Create the client instance
    openAuthClient = createClient({
      clientID: 'jwt-api',
      issuer,
    });

    console.log('OpenAuth client initialized successfully');
  } catch (error) {
    console.error('Failed to initialize OpenAuth client:', error);
    initError = error as Error;
  }
};

/**
 * Get the OpenAuth client instance
 * If the client isn't initialized yet, it will attempt initialization
 */
export const getOpenAuthClient = async (issuer: string): Promise<any> => {
  if (!initStarted) {
    await initializeOpenAuthClient(issuer);
  }

  if (initError) {
    throw initError;
  }

  if (!openAuthClient) {
    throw new Error('OpenAuth client initialization failed or is not complete');
  }

  return openAuthClient;
};
