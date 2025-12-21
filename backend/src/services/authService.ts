import User, { IUser } from '../models/User';
import AppError from '../utils/AppError';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import redisClient from '../config/redis';

const signToken = (id: string, secret: string, expiresIn: string) => {
  return jwt.sign({ id }, secret, { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] });
};

export const signup = async (userData: Partial<IUser>) => {
  const { email, password, role } = userData;
  const hashedPassword = await bcrypt.hash(password!, 12);

  const newUser = await User.create({
    email,
    password: hashedPassword,
    role,
  });
  console.log('New user created:', newUser.email);
  return newUser;
};

export const login = async (userData: Partial<IUser>) => {
  const { email, password } = userData;

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await bcrypt.compare(password!, user.password!))) {
    throw new AppError('Incorrect email or password', 401);
  }

  const accessToken = signToken(user._id.toString(), process.env.JWT_ACCESS_SECRET!, '15m');
  const refreshToken = signToken(user._id.toString(), process.env.JWT_REFRESH_SECRET!, '7d');

  user.refreshToken = await bcrypt.hash(refreshToken, 12);
  await user.save({ validateBeforeSave: false });

  return { user, accessToken, refreshToken };
};

export const refresh = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new AppError('No refresh token provided', 400);
  }

  let decoded: any;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!);
  } catch (err) {
    throw new AppError('Invalid refresh token', 401);
  }

  const user = await User.findById(decoded.id).select('+refreshToken');

  if (!user || !user.refreshToken) {
    throw new AppError('User not found or no refresh token', 401);
  }

  const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
  if (!isMatch) {
    // Reuse detection could be implemented here
    throw new AppError('Invalid refresh token', 401);
  }

  const newAccessToken = signToken(user._id.toString(), process.env.JWT_ACCESS_SECRET!, '15m');
  const newRefreshToken = signToken(user._id.toString(), process.env.JWT_REFRESH_SECRET!, '7d');

  user.refreshToken = await bcrypt.hash(newRefreshToken, 12);
  await user.save({ validateBeforeSave: false });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

export const logout = async (userId: string, accessToken: string) => {
  await User.findByIdAndUpdate(userId, { refreshToken: undefined });
  
  // Blacklist access token
  // 15 minutes in seconds = 900
  await redisClient.set(`blacklist:${accessToken}`, 'true', 'EX', 900);
};
