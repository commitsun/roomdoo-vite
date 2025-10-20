export class InternalServerError extends Error {
  constructor(public userMessage?: string) {
    super(userMessage);
    this.name = 'InternalServerError';
  }
}
