import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { connectDB } from '../utils/db';
import { User } from '../utils/Models';
import { protect } from '../middleware/auth';
import { successResponse, errorResponse, handleOptions, parseBody } from '../utils/response';
import { validateBody } from '../utils/validation';
import { ValidationError } from '../utils/errors';
import { handleError } from '../utils/errors';

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (event.httpMethod === 'OPTIONS') return handleOptions();
  try {
    await protect(event as any);
    await connectDB();
    const body = parseBody(event);
    const { isValid, errors } = validateBody(body, [
      { field: 'name', validate: (v) => v && v.trim() === '' ? 'Name cannot be empty' : null, message: '' },
      { field: 'phone', validate: (v) => v && !/^\+?[\d\s\-\(\)]{10,}$/.test(v) ? 'Valid phone number required' : null, message: '' },
      { field: 'address.street', validate: () => null, message: '' },
      { field: 'address.city', validate: () => null, message: '' },
      { field: 'address.state', validate: () => null, message: '' },
      { field: 'address.zipCode', validate: () => null, message: '' },
      { field: 'avatar', validate: () => null, message: '' },
    ]);
    if (!isValid) throw new ValidationError(errors);
    const fieldsToUpdate: any = {};
    if (body.name) fieldsToUpdate.name = body.name;
    if (body.phone) fieldsToUpdate.phone = body.phone;
    if (body.address) fieldsToUpdate.address = body.address;
    if (body.avatar) fieldsToUpdate.avatar = body.avatar;
    const user = await User.findByIdAndUpdate((event as any).user._id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    }).select('-password');
    return successResponse({ user });
  } catch (error) {
    const { statusCode, body: errorBody } = handleError(error);
    return errorResponse(errorBody.message, statusCode, errorBody.errors);
  }
};

export { handler };