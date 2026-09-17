export function createResponse(statusCode: number, body: any, headers: Record<string, string> = {}): any {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': process.env.CLIENT_URL || '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Credentials': 'true',
      ...headers,
    },
    body: JSON.stringify(body),
  };
}

export function successResponse(data: any, statusCode = 200, headers: Record<string, string> = {}): any {
  return createResponse(statusCode, { success: true, ...data }, headers);
}

export function errorResponse(message: string, statusCode = 400, errors?: any[]): any {
  return createResponse(statusCode, { success: false, message, errors });
}

export function handleOptions(): any {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.CLIENT_URL || '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Credentials': 'true',
    },
    body: '',
  };
}

export function parseBody(event: any): any {
  if (!event.body) return {};
  try {
    return JSON.parse(event.body);
  } catch {
    return {};
  }
}

export function getPathParams(event: any): Record<string, string> {
  return event.pathParameters || {};
}

export function getQueryParams(event: any): Record<string, any> {
  return event.queryStringParameters ?
    Object.fromEntries(
      Object.entries(event.queryStringParameters).map(([k, v]) => [k, v])
    ) : {};
}