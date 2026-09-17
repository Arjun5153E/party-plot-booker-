import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { successResponse, errorResponse, handleOptions, parseBody } from '../utils/response';
import { validateBody, validators } from '../utils/validation';
import { ValidationError } from '../utils/errors';
import { handleError } from '../utils/errors';

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (event.httpMethod === 'OPTIONS') return handleOptions();
  try {
    const body = parseBody(event);
    const { isValid, errors } = validateBody(body, [
      { field: 'token', validate: validators.required('Token'), message: 'Token required' },
      { field: 'password', validate: validators.minLength(6, 'Password'), message: 'Password must be at least 6 characters' },
    ]);
    if (!isValid) throw new ValidationError(errors);
    // TODO: Implement password reset with token verification
    return successResponse({
      message: 'Password reset functionality - implement with email service',
    });
  } catch (error) {
    const { statusCode, body: errorBody } = handleError(error);
    return errorResponse(errorBody.message, statusCode, errorBody.errors);
  }
};

export { handler };