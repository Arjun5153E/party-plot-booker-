import jwt, { SignOptions } from 'jsonwebtoken';
import { connectDB } from '../utils/db';
import { User, IUser } from '../utils/Models';
import { UnauthorizedError } from '../utils/errors';

const JWT_SECRET: jwt.Secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface AuthEvent {
  user?: IUser;
  token?: string;
  headers: Record<string, string>;
  cookies?: Record<string, string>;
}

export function generateToken(userId: string): string {
  const options: SignOptions = { expiresIn: JWT_EXPIRES_IN as any };
  return jwt.sign({ id: userId }, JWT_SECRET, options);
}

export function verifyToken(token: string): { id: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string };
  } catch {
    return null;
  }
}

export function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) return {};
  return cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
}

export async function protect(event: AuthEvent): Promise<void> {
  await connectDB();

  const authHeader = event.headers.authorization || event.headers.Authorization;
  const cookies = parseCookies(event.headers.cookie || event.headers.Cookie);

  let token: string | undefined;

  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (cookies.token) {
    token = cookies.token;
  }

  if (!token) {
    throw new UnauthorizedError('Not authorized, no token');
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    throw new UnauthorizedError('Not authorized, token invalid');
  }

  const user = await User.findById(decoded.id).select('-password');
  if (!user) {
    throw new UnauthorizedError('User not found');
  }

  event.user = user;
  event.token = token;
}

export function authorize(...roles: string[]) {
  return (event: AuthEvent): void => {
    if (!event.user || !roles.includes(event.user.role)) {
      throw new UnauthorizedError('Not authorized to access this route');
    }
  };
}

export async function optionalAuth(event: AuthEvent): Promise<void> {
  await connectDB();

  const authHeader = event.headers.authorization || event.headers.Authorization;
  const cookies = parseCookies(event.headers.cookie || event.headers.Cookie);

  let token: string | undefined;

  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (cookies.token) {
    token = cookies.token;
  }

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        event.user = user;
        event.token = token;
      }
    }
  }
}

export function sendTokenResponse(user: IUser, statusCode: number): { statusCode: number; body: any; headers: Record<string, string> } {
  const token = generateToken(user._id.toString());

  const cookieOptions = [
    `token=${token}`,
    `Expires=${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString()}`,
    'HttpOnly',
    process.env.NODE_ENV === 'production' ? 'Secure' : '',
    'SameSite=Lax',
    'Path=/',
  ].filter(Boolean).join('; ');

  return {
    statusCode,
    headers: {
      'Set-Cookie': cookieOptions,
      'Content-Type': 'application/json',
    },
    body: {
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        address: user.address,
      },
    },
  };
}