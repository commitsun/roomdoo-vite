export class AppError extends Error {
  constructor(public code: string, public userMessage?: string) {
    super(userMessage);
    this.name = 'AppError';
  }
}
