/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ApiError, ValidationError } from './api.types';

export type ErrorClassification =
  | 'network_error'
  | 'authentication_error'
  | 'authorization_error'
  | 'validation_error'
  | 'database_error'
  | 'googledrive_error'
  | 'unknown_error';

export class AppError extends Error {
  public classification: ErrorClassification;
  public details?: any;
  public validationErrors?: ValidationError[];

  constructor(
    classification: ErrorClassification,
    message: string,
    details?: any,
    validationErrors?: ValidationError[]
  ) {
    super(message);
    this.name = 'AppError';
    this.classification = classification;
    this.details = details;
    this.validationErrors = validationErrors;
  }
}

export const ErrorHandler = {
  /**
   * Translates any thrown error into a standardized ApiError wrapper.
   */
  handle(error: any): ApiError {
    console.error('[Centralized Error Handler]', error);

    // If it's already an AppError
    if (error instanceof AppError) {
      return {
        code: error.classification,
        message: error.message,
        details: error.details,
        validationErrors: error.validationErrors,
      };
    }

    // Check if it's a HTTP / Database-specific error
    if (error && typeof error === 'object' && error.status && error.url) {
      return {
        code: error.status === 401 ? 'authentication_error' : error.status === 403 ? 'authorization_error' : 'database_error',
        message: error.message || `Database error with status code ${error.status}`,
        details: {
          status: error.status,
          url: error.url,
          response: error.data,
        },
      };
    }

    // Check if it's a Google Drive API error
    if (error && typeof error === 'object' && error.message && (error.message.includes('Google Drive') || error.message.includes('gdrive'))) {
      return {
        code: 'googledrive_error',
        message: error.message,
        details: error,
      };
    }

    // Check if it's a typical Fetch/Network error
    if (error instanceof TypeError && error.message.includes('failed to fetch')) {
      return {
        code: 'network_error',
        message: 'Falha de conexão com a rede. Verifique seu acesso à internet.',
        details: error,
      };
    }

    // Default unknown error
    return {
      code: 'unknown_error',
      message: error instanceof Error ? error.message : 'Ocorreu um erro inesperado no sistema.',
      details: error,
    };
  }
};
