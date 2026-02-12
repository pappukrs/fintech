export abstract class CustomError extends Error {
    abstract statusCode: number;

    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, CustomError.prototype);
    }

    abstract serializeErrors(): { message: string; field?: string }[];
}

export class BadRequestError extends CustomError {
    statusCode = 400;
    constructor(public message: string) {
        super(message);
        Object.setPrototypeOf(this, BadRequestError.prototype);
    }
    serializeErrors() {
        return [{ message: this.message }];
    }
}

export class NotFoundError extends CustomError {
    statusCode = 404;
    constructor() {
        super('Route not found');
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
    serializeErrors() {
        return [{ message: 'Not found' }];
    }
}

export class NotAuthorizedError extends CustomError {
    statusCode = 401;
    constructor() {
        super('Not authorized');
        Object.setPrototypeOf(this, NotAuthorizedError.prototype);
    }
    serializeErrors() {
        return [{ message: 'Not authorized' }];
    }
}

export class InternalServerError extends CustomError {
    statusCode = 500;
    constructor(public message: string = 'Internal server error') {
        super(message);
        Object.setPrototypeOf(this, InternalServerError.prototype);
    }
    serializeErrors() {
        return [{ message: this.message }];
    }
}
