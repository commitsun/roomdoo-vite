export interface EntityListResponse<T = unknown> {
  count: number;
  items: T[];
}
