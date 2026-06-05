// Rate Limiter Middleware
// This middleware limits the number of requests a client can make to the server within a specified time window.
// 1. A global limiter — for all routes
// 2. A login limiter — stricter, keyed by IP + email
// 3. A registration limiter — stricter, keyed by IP + email
// 4. An OTP limiter — for /auth/verify-otp and /auth/register

import rateLimit from 'express-rate-limit';
import { Request } from 'express';
import { logger } from '../utils/loggers';

// Global limiter: 100 requests per 15 minutes per IP
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: { error: 'Too many requests from this IP, please try again later.' },
    handler: (req: Request, res) => {
        logger.warn(`Global rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({ error: 'Too many requests from this IP, please try again later.' });
    },
})

// Login limiter: 5 attempts per 15 minutes per IP + email
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    keyGenerator: (req: Request) => {
        const email = req.body.email || '';
        return `${req.ip}-${email}`;
    },
    message: { error: 'Too many login attempts, please try again later.' },
    handler: (req: Request, res) => {
        logger.warn(`Login rate limit exceeded for IP: ${req.ip} and email: ${req.body.email}`);
        res.status(429).json({ error: 'Too many login attempts, please try again later.' });
    },
})

// Registration limiter: 3 attempts per  1 hour per IP + email
export const registrationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    keyGenerator: (req: Request) => {
        const email = req.body.email || '';
        return `${req.ip}-${email}`;
    },
    message: { error: 'Too many registration attempts, please try again later.' },
    handler: (req: Request, res) => {
        logger.warn(`Registration rate limit exceeded for IP: ${req.ip} and email: ${req.body.email}`);
        res.status(429).json({ error: 'Too many registration attempts, please try again later.' });
    },
})

// OTP limiter: 5 attempts per 10 minutes per user ID
export const otpLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 5,
    keyGenerator: (req: Request) => {
        const userId = req.body.user_id || '';
        return `otp-${userId}`;
    },
    message: { error: 'Too many OTP verification attempts, please try again later.' },
    handler: (req: Request, res) => {
        logger.warn(`OTP rate limit exceeded for user ID: ${req.body.user_id}`);
        res.status(429).json({ error: 'Too many OTP verification attempts, please try again later.' });
    },
});

// Refresh token limiter: 10 attempts per 15 minutes per IP
export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,                    // more lenient than login
  keyGenerator: (req) => req.ip as string,
  handler: (req, res) => {
    logger.warn(`Refresh rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({ error: 'Too many refresh attempts. Try again later.' });
  }
});

// Resend OTP limiter: 5 attempts per 15 minutes per IP + email
export const resendOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  keyGenerator: (req) => {
    const email = req.body.email || '';
    return `${req.ip}-${email}`;
  },
  handler: (req, res) => {
    logger.warn(`Resend OTP rate limit exceeded for IP: ${req.ip} and email: ${req.body.email}`);
    res.status(429).json({ error: 'Too many OTP resend attempts. Try again later.' });
  }
});

// follows rate limiter: 20 attempts in 15 minutes per user ID
export const followsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  keyGenerator: (req) => `follows-${req.user?.id || req.ip}`,
  handler: (req, res) => {
    logger.warn(`Follows rate limit exceeded for user ID: ${req.body.user_id}`);
    res.status(429).json({ error: 'Too many follow/unfollow attempts. Try again later.' });
  }
});

// user skills limiter

export const addSkillLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 30,
  keyGenerator: (req) => `add-skill-${req.user?.id || req.ip}`,
  handler: (req, res) => {
    logger.warn(`Add skill limit exceeded for user: ${req.user?.id}`);
    res.status(429).json({ error: 'Too many skill additions. Try again later.' });
  }
});

export const removeSkillLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 15,
  keyGenerator: (req) => `remove-skill-${req.user?.id || req.ip}`,
  handler: (req, res) => {
    logger.warn(`Remove skill limit exceeded for user: ${req.user?.id}`);
    res.status(429).json({ error: 'Too many skill removals. Try again later.' });
  }
});