export class BadRequestError extends Error {
  constructor(public userMessage?: string) {
    super(userMessage);
    this.name = 'BadRequestError';
  }
}
