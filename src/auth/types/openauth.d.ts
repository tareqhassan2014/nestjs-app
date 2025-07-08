// Type declarations for @openauthjs/openauth modules

// Client module
declare module '@openauthjs/openauth/client' {
  export interface OpenAuthClientConfig {
    clientID: string;
    issuer: string;
    [key: string]: any;
  }

  export interface VerificationResult {
    err?: string;
    subject?: {
      properties: {
        id: string;
        email: string;
        name: string;
        role?: string;
        [key: string]: any;
      };
    };
    [key: string]: any;
  }

  export interface OpenAuthClient {
    verify: (subjects: any, token: string) => Promise<VerificationResult>;
    [key: string]: any;
  }

  export function createClient(config: OpenAuthClientConfig): OpenAuthClient;
}

// Subject module
declare module '@openauthjs/openauth/subject' {
  import { ObjectSchema } from 'valibot';

  export interface SubjectProperty {
    type: string;
    optional?: boolean;
    [key: string]: any;
  }

  export interface SubjectDefinition {
    properties: {
      [key: string]: SubjectProperty;
    };
  }

  // Add support for Valibot ObjectSchema
  export type ValibotSubjectDefinition = ObjectSchema<any, any>;

  export interface SubjectsDefinition {
    [key: string]: SubjectDefinition | ValibotSubjectDefinition;
  }

  export function createSubjects(definition: SubjectsDefinition): any;
}
