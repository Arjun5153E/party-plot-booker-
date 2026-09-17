export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  errors?: any[];

  constructor(message: string, statusCode: number, errors?: any[]) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(errors: any[]) {
    super('Validation failed', 400, errors);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

export function handleError(error: unknown): { statusCode: number; body: any } {
  const err = error as Error;
  console.error('Error:', err);

  if (err instanceof AppError) {
    return {
      statusCode: err.statusCode,
      body: {
        success: false,
        message: err.message,
        errors: err.errors,
      },
    };
  }

  if (err.name === 'ValidationError') {
    const errors = Object.values((err as any).errors).map((e: any) => ({
      field: e.path,
      message: e.message,
    }));
    return {
      statusCode: 400,
      body: {
        success: false,
        message: 'Validation failed',
        errors,
      },
    };
  }

  if (err.name === 'CastError') {
    const castError = err as any;
    return {
      statusCode: 400,
      body: {
        success: false,
        message: `Invalid ${castError.path}: ${castError.value}`,
      },
    };
  }

  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue)[0];
    return {
      statusCode: 400,
      body: {
        success: false,
        message: `${field} already exists`,
      },
    };
  }

  if (err.name === 'JsonWebTokenError') {
    return {
      statusCode: 401,
      body: { success: false, message: 'Invalid token' },
    };
  }

  if (err.name === 'TokenExpiredError') {
    return {
      statusCode: 401,
      body: { success: false, message: 'Token expired' },
    };
  }

  return {
    statusCode: 500,
    body: {
      success: false,
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    },
  };
}

export function asyncHandler(fn: Function) {
  return async (event: any, context: any) => {
    try {
      return await fn(event, context);
    } catch (error) {
      return handleError(error);
    }
  };
}