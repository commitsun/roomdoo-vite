export class HttpError extends Error {
  constructor(
    public status: number,
  ) {
    super(`HTTP ${status}`);
    this.name = 'HttpError';
  }
}
