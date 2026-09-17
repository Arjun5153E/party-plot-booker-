import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { errorResponse, handleOptions } from '../utils/response';
import { handleError } from '../utils/errors';

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (event.httpMethod === 'OPTIONS') return handleOptions();
  try {
    const cookieOptions = [
      'token=none',
      'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
      'HttpOnly',
      process.env.NODE_ENV === 'production' ? 'Secure' : '',
      'SameSite=Lax',
      'Path=/',
    ].filter(Boolean).join('; ');
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': cookieOptions,
        'Access-Control-Allow-Origin': process.env.CLIENT_URL || '*',
        'Access-Control-Allow-Credentials': 'true',
      },
      body: JSON.stringify({
        success: true,
        message: 'Logged out successfully',
      }),
    };
  } catch (error) {
    const { statusCode, body: errorBody } = handleError(error);
    return errorResponse(errorBody.message, statusCode, errorBody.errors);
  }
};

export { handler };