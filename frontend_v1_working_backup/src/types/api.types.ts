/**
 * @file API types
 * @description Type definitions for API responses and errors
 * @module types/api
 */

export interface ApiErrorResponse {
  error?: string;
  message?: string;
  code?: string;
}
