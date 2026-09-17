import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { connectDB } from '../utils/db';
import { User } from '../utils/Models';
import { protect, sendTokenResponse } from '../middleware/auth';
import { errorResponse, handleOptions, parseBody } from '../utils/response';
import { validateBody, validators } from '../utils/validation';
import { ValidationError } from '../utils/errors';
import { handleError } from '../utils/errors';

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (event.httpMethod === 'OPTIONS') return handleOptions();
  try {
    await protect(event as any);
    await connectDB();
    const body = parseBody(event);
    const { isValid, errors } = validateBody(body, [
      { field: 'currentPassword', validate: validators.required('Current password'), message: 'Current password required' },
      { field: 'newPassword', validate: validators.minLength(6, 'New password'), message: 'New password must be at least 6 characters' },
    ]);
    if (!isValid) throw new ValidationError(errors);
    const user = await User.findById((event as any).user._id).select('+password');
    if (!user) return errorResponse('User not found', 404);
    const isMatch = await user.comparePassword(body.currentPassword);
    if (!isMatch) throw new ValidationError([{ field: 'currentPassword', message: 'Current password is incorrect' }]);
    user.password = body.newPassword;
    await user.save();
    return sendTokenResponse(user, 200);
  } catch (error) {
    const { statusCode, body: errorBody } = handleError(error);
    return errorResponse(errorBody.message, statusCode, errorBody.errors);
  }
};

export { handler };