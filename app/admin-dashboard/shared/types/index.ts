/**
 * Shared admin dashboard types
 */

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ListResponse<T> {
  success: boolean
  data: T[]
  pagination: PaginationMeta
}

export interface OneResponse<T> {
  success: boolean
  data: T
}
