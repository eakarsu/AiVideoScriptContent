import { Request, Response } from 'express';
import crypto from 'crypto';
import { User } from '../models';
import { generateToken, AuthRequest } from '../middleware/auth.middleware';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ error: 'Email, password, and name are required' });
      return;
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'User with this email already exists' });
      return;
    }

    const user = await User.create({ email, password, name });
    const token = generateToken(user.id, user.email);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, totpCode } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Check 2FA
    if (user.twoFactorEnabled) {
      if (!totpCode) {
        res.json({ requires2FA: true, message: 'Please provide your 2FA code' });
        return;
      }
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret!,
        encoding: 'base32',
        token: totpCode,
      });
      if (!verified) {
        res.status(401).json({ error: 'Invalid 2FA code' });
        return;
      }
    }

    const token = generateToken(user.id, user.email);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: ['id', 'email', 'name', 'role', 'twoFactorEnabled', 'createdAt'],
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const { name, email } = req.body;
    if (email && email !== user.email) {
      const existing = await User.findOne({ where: { email } });
      if (existing) {
        res.status(400).json({ error: 'Email already in use' });
        return;
      }
    }

    await user.update({ name: name || user.name, email: email || user.email });

    res.json({
      message: 'Profile updated',
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Current password and new password are required' });
      return;
    }

    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      res.status(401).json({ error: 'Current password is incorrect' });
      return;
    }

    await user.update({ password: newPassword });
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if user exists
      res.json({ message: 'If the email exists, a reset token has been generated' });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await user.update({ resetToken, resetTokenExpiry });

    // In a demo app, we return the token directly (no email)
    res.json({
      message: 'Reset token generated',
      resetToken,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      res.status(400).json({ error: 'Token and new password are required' });
      return;
    }

    const user = await User.findOne({
      where: { resetToken: token },
    });

    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      res.status(400).json({ error: 'Invalid or expired reset token' });
      return;
    }

    await user.update({
      password: newPassword,
      resetToken: null,
      resetTokenExpiry: null,
    });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

// 2FA Endpoints
export const setup2FA = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const secret = speakeasy.generateSecret({
      name: `CreatorAI (${user.email})`,
      issuer: 'CreatorAI',
    });

    await user.update({ twoFactorSecret: secret.base32 });

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    res.json({
      secret: secret.base32,
      qrCode: qrCodeUrl,
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({ error: 'Failed to setup 2FA' });
  }
};

export const verify2FA = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findByPk(req.userId);
    if (!user || !user.twoFactorSecret) {
      res.status(400).json({ error: 'Please set up 2FA first' });
      return;
    }

    const { code } = req.body;
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
    });

    if (!verified) {
      res.status(400).json({ error: 'Invalid verification code' });
      return;
    }

    await user.update({ twoFactorEnabled: true });
    res.json({ message: '2FA enabled successfully' });
  } catch (error) {
    console.error('2FA verify error:', error);
    res.status(500).json({ error: 'Failed to verify 2FA' });
  }
};

export const disable2FA = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    await user.update({
      twoFactorEnabled: false,
      twoFactorSecret: null,
    });

    res.json({ message: '2FA disabled successfully' });
  } catch (error) {
    console.error('2FA disable error:', error);
    res.status(500).json({ error: 'Failed to disable 2FA' });
  }
};
