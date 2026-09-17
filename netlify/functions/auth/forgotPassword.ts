import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { connectDB } from '../utils/db';
import { User } from '../utils/Models';
import { successResponse, errorResponse, handleOptions, parseBody } from '../utils/response';
import { validateBody, validators } from '../utils/validation';
import { ValidationError } from '../utils/errors';
import { handleError } from '../utils/errors';

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (event.httpMethod === 'OPTIONS') return handleOptions();
  try {
    await connectDB();
    const body = parseBody(event);
    const { isValid, errors } = validateBody(body, [
      { field: 'email', validate: validators.email(), message: 'Valid email required' },
    ]);
    if (!isValid) throw new ValidationError(errors);
    const user = await User.findOne({ email: body.email });
    if (!user) {
      return successResponse({
        message: 'If email exists, reset instructions sent',
      });
    }
    // TODO: Implement email sending with reset token
    return successResponse({
      message: 'If email exists, reset instructions sent',
    });
  } catch (error) {
    const { statusCode, body: errorBody } = handleError(error);
    return errorResponse(errorBody.message, statusCode, errorBody.errors);
  }
};

export { handler };