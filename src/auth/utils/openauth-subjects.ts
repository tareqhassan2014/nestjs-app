/**
 * Define OpenAuth subjects for token verification
 * These describe the structure of the JWT claims that are considered valid
 */

import { object, string } from 'valibot';

import { loadOpenAuth } from './openauth-loader.util';

/**
 * Get the subjects for token verification
 * This is the structure that JWT tokens must adhere to
 */
export const getSubjects = async () => {
  try {
    // Load the OpenAuth modules
    const { createSubjects } = await loadOpenAuth();

    const subjects = createSubjects({
      user: object({
        id: string(),
        email: string(),
      }),
    });

    return subjects;
  } catch (error) {
    console.error('Failed to create OpenAuth subjects:', error);
    throw error;
  }
};
