export function validateBody(body: any, rules: Array<{ field: string; validate: (value: any) => string | null; message: string }>) {
  const errors: Array<{ field: string; message: string }> = [];
  for (const rule of rules) {
    const value = getNestedValue(body, rule.field);
    const error = rule.validate(value);
    if (error) {
      errors.push({ field: rule.field, message: error });
    }
  }
  return { isValid: errors.length === 0, errors };
}

function getNestedValue(obj: any, path: string) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

export const validators = {
  required: (fieldName: string) => (value: any) => value === undefined || value === null || value === '' ? `${fieldName} is required` : null,
  email: () => (value: any) => value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Valid email is required' : null,
  minLength: (min: number, fieldName: string) => (value: any) => value && value.length < min ? `${fieldName} must be at least ${min} characters` : null,
  isIn: (values: any[], fieldName: string) => (value: any) => value && !values.includes(value) ? `Invalid ${fieldName}` : null,
  isMongoId: (fieldName: string) => (value: any) => value && !/^[0-9a-fA-F]{24}$/.test(value) ? `Invalid ${fieldName}` : null,
  isFloat: (options: { min?: number; max?: number }, fieldName: string) => (value: any) => {
    const num = parseFloat(value);
    if (isNaN(num)) return `${fieldName || 'Value'} must be a number`;
    if (options?.min !== undefined && num < options.min) return `${fieldName || 'Value'} must be at least ${options.min}`;
    if (options?.max !== undefined && num > options.max) return `${fieldName || 'Value'} must be at most ${options.max}`;
    return null;
  },
  isInt: (options: { min?: number; max?: number }, fieldName: string) => (value: any) => {
    const num = parseInt(value);
    if (isNaN(num)) return `${fieldName || 'Value'} must be an integer`;
    if (options?.min !== undefined && num < options.min) return `${fieldName || 'Value'} must be at least ${options.min}`;
    if (options?.max !== undefined && num > options.max) return `${fieldName || 'Value'} must be at most ${options.max}`;
    return null;
  },
  isISO8601: (fieldName: string) => (value: any) => value && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value) ? `Valid ${fieldName} required (ISO 8601)` : null,
  matches: (regex: RegExp, fieldName: string) => (value: any) => value && !regex.test(value) ? `Invalid ${fieldName} format` : null,
};

export function sanitizeInput(obj: any): any {
  if (typeof obj === 'string') {
    return obj.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeInput);
  }
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      sanitized[key] = sanitizeInput(obj[key]);
    }
    return sanitized;
  }
  return obj;
}

export function parseQueryParams(queryStringParameters: Record<string, string> | null): Record<string, any> {
  if (!queryStringParameters) return {};
  const parsed: Record<string, any> = {};
  for (const [key, value] of Object.entries(queryStringParameters)) {
    if (value === 'true') parsed[key] = true;
    else if (value === 'false') parsed[key] = false;
    else if (!isNaN(Number(value)) && value !== '') parsed[key] = Number(value);
    else parsed[key] = value;
  }
  return parsed;
}