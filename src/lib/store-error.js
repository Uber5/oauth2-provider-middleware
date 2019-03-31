module.exports = class StoreError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, StoreError);
    Object.setPrototypeOf(this, StoreError.prototype);
    this.status = status;
  }
};
