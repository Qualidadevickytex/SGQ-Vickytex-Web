/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Standard API Response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: ApiError;
  timestamp: string;
}

/**
 * Paginated response wrapper for large datasets
 */
export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
}

/**
 * Standard API Error structure
 */
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  validationErrors?: ValidationError[];
}

/**
 * Validation Error structure for inputs
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Standard Service Contract Interface
 */
export interface BaseService<T> {
  findAll(): Promise<ApiResponse<T[]>>;
  findById(id: string): Promise<ApiResponse<T | null>>;
  create(data: Partial<T>): Promise<ApiResponse<T>>;
  update(id: string, data: Partial<T>): Promise<ApiResponse<T>>;
  delete(id: string): Promise<ApiResponse<boolean>>;
  subscribe?(callback: (event: any) => void): () => void;
  search?(query: string): Promise<ApiResponse<T[]>>;
  count?(): Promise<ApiResponse<number>>;
  paginate?(page: number, limit: number): Promise<ApiResponse<PaginatedResponse<T>>>;
}
