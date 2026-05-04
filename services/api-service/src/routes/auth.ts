import type { FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

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

    const token = app.jwt.sign({ id: user.id, email: user.email });
    return reply.status(201).send({ success: true, data: { user, token } });
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

    const token = app.jwt.sign({ id: user.id, email: user.email });
    return reply.send({ success: true, data: { user: { id: user.id, email: user.email, name: user.name }, token } });
  });
}
