export class NotFoundError extends Error {
  constructor(message = 'Not found') {
    super(message);
  }
}
