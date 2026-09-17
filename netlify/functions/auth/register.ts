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
      { field: 'name', validate: validators.required('Name'), message: 'Name is required' },
      { field: 'email', validate: validators.email(), message: 'Valid email is required' },
      { field: 'password', validate: validators.minLength(6, 'Password'), message: 'Password must be at least 6 characters' },
      { field: 'phone', validate: (v) => v && !/^\+?[\d\s\-\(\)]{10,}$/.test(v) ? 'Valid phone number required' : null, message: '' },
      { field: 'role', validate: validators.isIn(['user', 'venue_owner'], 'role'), message: 'Invalid role' },
    ]);
    if (!isValid) throw new ValidationError(errors);
    const existingUser = await User.findOne({ email: body.email });
    if (existingUser) throw new ValidationError([{ field: 'email', message: 'Email already registered' }]);
    const user = await User.create({
      name: body.name,
      email: body.email,
      password: body.password,
      phone: body.phone,
      role: body.role || 'user',
    });
    return sendTokenResponse(user, 201);
  } catch (error) {
    const { statusCode, body: errorBody } = handleError(error);
    return errorResponse(errorBody.message, statusCode, errorBody.errors);
  }
};

export { handler };