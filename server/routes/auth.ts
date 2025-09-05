import type { RequestHandler } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { sendWelcomeEmail } from "../mail";

const signupSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

function signToken(userId: string) {
  const secret = process.env.JWT_SECRET || "dev-secret-change";
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign({ sub: userId }, secret, { expiresIn });
}

export const signupHandler: RequestHandler = async (req, res) => {
  try {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "invalid_body", details: parsed.error.flatten() });
    const { email, password, name } = parsed.data;

    const existing = await User.findOne({ email }).lean();
    if (existing) return res.status(409).json({ error: "email_exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash, name });
    const token = signToken(user.id);

    // Try sending welcome email, but do not fail signup if it errors
    try {
      await sendWelcomeEmail(user.email, user.name || undefined);
    } catch {}

    return res.json({
      user: { id: user.id, email: user.email, name: user.name },
      token,
    });
  } catch (e: any) {
    return res.status(500).json({ error: "server_error", message: e?.message });
  }
};

export const loginHandler: RequestHandler = async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "invalid_body", details: parsed.error.flatten() });
    const { email, password } = parsed.data;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "invalid_credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "invalid_credentials" });

    const token = signToken(user.id);
    return res.json({ user: { id: user.id, email: user.email, name: user.name }, token });
  } catch (e: any) {
    return res.status(500).json({ error: "server_error", message: e?.message });
  }
};
