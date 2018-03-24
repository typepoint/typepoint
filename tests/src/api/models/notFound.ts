export class NotFoundError extends Error {
  constructor(message: string = 'Not found') {
    super(message);
  }
}
