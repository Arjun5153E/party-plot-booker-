import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { successResponse, handleOptions } from './utils/response';

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (event.httpMethod === 'OPTIONS') return handleOptions();

  return successResponse({
    message: 'Party Plot Booker API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
};

export { handler };