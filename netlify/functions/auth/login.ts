import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { connectDB } from '../utils/db';
import { User } from '../utils/Models';
import { sendTokenResponse } from '../middleware/auth';
import { errorResponse, handleOptions, parseBody } from '../utils/response';
import { validateBody, validators } from '../utils/validation';
import { ValidationError } from '../utils/errors';
import { handleError } from '../utils/errors';

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (event.httpMethod === 'OPTIONS') return handleOptions();
  try {
    await connectDB();
    const body = parseBody(event);
    const { isValid, errors } = validateBody(body, [
      { field: 'email', validate: validators.email(), message: 'Valid email is required' },
      { field: 'password', validate: validators.required('Password'), message: 'Password is required' },
    ]);
    if (!isValid) throw new ValidationError(errors);
    const user = await User.findOne({ email: body.email }).select('+password');
    if (!user) throw new ValidationError([{ field: 'email', message: 'Invalid credentials' }]);
    const isMatch = await user.comparePassword(body.password);
    if (!isMatch) throw new ValidationError([{ field: 'password', message: 'Invalid credentials' }]);
    return sendTokenResponse(user, 200);
  } catch (error) {
    const { statusCode, body: errorBody } = handleError(error);
    return errorResponse(errorBody.message, statusCode, errorBody.errors);
  }
};

export { handler };