import 'reflect-metadata';

export const DESCRIPTION_METADATA_KEY = 'description';

/**
 * Decorator to add description metadata to environment variables
 * This can be used for documentation and validation purposes
 */
export function Description(description: string): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol | undefined) {
    if (propertyKey) {
      Reflect.defineMetadata(
        DESCRIPTION_METADATA_KEY,
        description,
        target,
        propertyKey,
      );
    }
  };
}
