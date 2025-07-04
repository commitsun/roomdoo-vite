export class ApiError extends Error {
  constructor(public readonly status: number) {
    super('api error' + (status ? ` ${status}` : ''));
    this.name = 'ApiError';
  }
}
export class InternalServerError extends ApiError {
  constructor() {
    super(500);
    this.name = 'InternalServerError';
  }
}
export class NotFoundError extends ApiError {
  constructor() {
    super(404);
    this.name = 'NotFoundError';
  }
}
export class UnauthorizedError extends ApiError {
  constructor() {
    super(401);
    this.name = 'UnauthorizedError';
  }
}
export class ForbiddenError extends ApiError {
  constructor() {
    super(403);
    this.name = 'ForbiddenError';
  }
}
