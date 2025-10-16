export class CityNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CityNotFoundError';
  }
}