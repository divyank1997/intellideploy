import type { FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import crypto from 'crypto';

const REFRESH_TOKEN_TTL_DAYS = 7;

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const refreshSchema = z.object({
  refreshToken: z.string(),
});

function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString('hex');
}

function refreshTokenExpiry(): Date {
  const d = new Date();
  d.setDate(d.getDate() + REFRESH_TOKEN_TTL_DAYS);
  return d;
}

async function issueTokens(app: FastifyInstance, userId: string, email: string) {
  const accessToken = app.jwt.sign({ id: userId, email }, { expiresIn: '15m' });

  const refreshToken = generateRefreshToken();
  await app.prisma.refreshToken.create({
    data: { token: refreshToken, userId, expiresAt: refreshTokenExpiry() },
  });

  return { accessToken, refreshToken };
}

export async function authRoutes(app: FastifyInstance) {
  app.post('/auth/register', async (req, reply) => {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      return reply.status(400).send({ success: false, error: { message: result.error.message } });
    }

    const { email, name, password } = result.data;

    const existing = await app.prisma.user.findUnique({ where: { email } });
    if (existing) {
      return reply.status(409).send({ success: false, error: { message: 'Email already in use' } });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await app.prisma.user.create({
      data: { email, name, password: hashed },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    const { accessToken, refreshToken } = await issueTokens(app, user.id, user.email);
    return reply.status(201).send({ success: true, data: { user, accessToken, refreshToken } });
  });

  app.post('/auth/login', async (req, reply) => {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      return reply.status(400).send({ success: false, error: { message: result.error.message } });
    }

    const { email, password } = result.data;

    const user = await app.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return reply.status(401).send({ success: false, error: { message: 'Invalid credentials' } });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return reply.status(401).send({ success: false, error: { message: 'Invalid credentials' } });
    }

    const { accessToken, refreshToken } = await issueTokens(app, user.id, user.email);
    return reply.send({
      success: true,
      data: { user: { id: user.id, email: user.email, name: user.name }, accessToken, refreshToken },
    });
  });

  app.post('/auth/refresh', async (req, reply) => {
    const result = refreshSchema.safeParse(req.body);
    if (!result.success) {
      return reply.status(400).send({ success: false, error: { message: 'refreshToken required' } });
    }

    const { refreshToken } = result.data;

    const stored = await app.prisma.refreshToken.findUnique({ where: { token: refreshToken } });

    if (!stored || stored.expiresAt < new Date()) {
      // Delete if expired
      if (stored) await app.prisma.refreshToken.delete({ where: { token: refreshToken } });
      return reply.status(401).send({ success: false, error: { message: 'Invalid or expired refresh token' } });
    }

    // Rotation — delete old, issue new
    await app.prisma.refreshToken.delete({ where: { token: refreshToken } });

    const user = await app.prisma.user.findUnique({
      where: { id: stored.userId },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      return reply.status(401).send({ success: false, error: { message: 'User not found' } });
    }

    const { accessToken, refreshToken: newRefreshToken } = await issueTokens(app, user.id, user.email);
    return reply.send({ success: true, data: { user, accessToken, refreshToken: newRefreshToken } });
  });

  app.post('/auth/logout', async (req, reply) => {
    const result = refreshSchema.safeParse(req.body);
    if (result.success) {
      await app.prisma.refreshToken.deleteMany({ where: { token: result.data.refreshToken } });
    }
    return reply.send({ success: true, data: { message: 'Logged out' } });
  });
}
