export class RateLimitError extends Error {
  readonly retryAfter: number;

  constructor(retryAfter: number = 300) {
    // Default 5 minutes
    super('API rate limit exceeded');
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}
