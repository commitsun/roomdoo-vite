export class HttpError extends Error {
  constructor(
    public status: number,
    public url: string,
    public method: string,
    public original: any
  ) {
    super(`HTTP ${status} - ${method.toUpperCase()} ${url}`);
    this.name = 'HttpError';
  }
}
