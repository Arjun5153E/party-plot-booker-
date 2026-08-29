import { Request, Response } from 'express';
import { User, IUser } from '../models';
import { generateToken, AuthRequest } from '../middleware/auth';
import { asyncHandler, ValidationError } from '../middleware/errorHandler';

const sendTokenResponse = (user: IUser, statusCode: number, res: Response): void => {
  const token = generateToken(user._id.toString());

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const
  };

  res.cookie('token', token, cookieOptions);

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      address: user.address
    }
  });
};

export const register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, phone, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ValidationError([{ field: 'email', message: 'Email already registered' }]);
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: role || 'user'
  });

  sendTokenResponse(user, 201, res);
});

export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ValidationError([
      { field: 'email', message: 'Email is required' },
      { field: 'password', message: 'Password is required' }
    ]);
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new ValidationError([{ field: 'email', message: 'Invalid credentials' }]);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ValidationError([{ field: 'password', message: 'Invalid credentials' }]);
  }

  sendTokenResponse(user, 200, res);
});

export const logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  const user = await User.findById(req.user._id).populate('bookings').populate('favoriteVenues');
  
  res.status(200).json({
    success: true,
    user: {
      id: user!._id,
      name: user!.name,
      email: user!.email,
      role: user!.role,
      avatar: user!.avatar,
      phone: user!.phone,
      address: user!.address,
      bookings: user!.bookings,
      favoriteVenues: user!.favoriteVenues,
      createdAt: user!.createdAt
    }
  });
});

export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  const { name, phone, address, avatar } = req.body;
  const fieldsToUpdate: Partial<IUser> = {};

  if (name) fieldsToUpdate.name = name;
  if (phone) fieldsToUpdate.phone = phone;
  if (address) fieldsToUpdate.address = address;
  if (avatar) fieldsToUpdate.avatar = avatar;

  const user = await User.findByIdAndUpdate(req.user._id, fieldsToUpdate, {
    new: true,
    runValidators: true
  }).select('-password');

  res.status(200).json({
    success: true,
    user
  });
});

export const updatePassword = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ValidationError([{ field: 'currentPassword', message: 'Current password is incorrect' }]);
  }

  user.password = newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    res.status(200).json({
      success: true,
      message: 'If email exists, reset instructions sent'
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: 'If email exists, reset instructions sent'
  });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    message: 'Password reset functionality - implement with email service'
  });
});