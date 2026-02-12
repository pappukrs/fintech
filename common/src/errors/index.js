"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalServerError = exports.NotAuthorizedError = exports.NotFoundError = exports.BadRequestError = exports.CustomError = void 0;
class CustomError extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, CustomError.prototype);
    }
}
exports.CustomError = CustomError;
class BadRequestError extends CustomError {
    message;
    statusCode = 400;
    constructor(message) {
        super(message);
        this.message = message;
        Object.setPrototypeOf(this, BadRequestError.prototype);
    }
    serializeErrors() {
        return [{ message: this.message }];
    }
}
exports.BadRequestError = BadRequestError;
class NotFoundError extends CustomError {
    statusCode = 404;
    constructor() {
        super('Route not found');
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
    serializeErrors() {
        return [{ message: 'Not found' }];
    }
}
exports.NotFoundError = NotFoundError;
class NotAuthorizedError extends CustomError {
    statusCode = 401;
    constructor() {
        super('Not authorized');
        Object.setPrototypeOf(this, NotAuthorizedError.prototype);
    }
    serializeErrors() {
        return [{ message: 'Not authorized' }];
    }
}
exports.NotAuthorizedError = NotAuthorizedError;
class InternalServerError extends CustomError {
    message;
    statusCode = 500;
    constructor(message = 'Internal server error') {
        super(message);
        this.message = message;
        Object.setPrototypeOf(this, InternalServerError.prototype);
    }
    serializeErrors() {
        return [{ message: this.message }];
    }
}
exports.InternalServerError = InternalServerError;
//# sourceMappingURL=index.js.map