import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { AppError } from "../utils/AppError";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
} from "./validators/auth.schema";

/* ===================== HELPER ===================== */
const getFirstZodError = (error: any): string => {
  if (!error || typeof error.flatten !== "function") return "Invalid input";

  const flattened = error.flatten();
  const firstError = Object.values(flattened.fieldErrors)
    .flat()
    .filter(Boolean)[0];

  return typeof firstError === "string" ? firstError : "Invalid input";
};

/* ===================== REGISTER ===================== */
export const register = async (req: Request, res: Response) => {
  // Validate request
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(getFirstZodError(parsed.error), 400);
  }

  const { name, email, password } = parsed.data;

  // Check if email already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError("Email already exists", 400);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user with name, email, password
  await prisma.user.create({
    data: { name, email, password: hashedPassword },
  });

  res.status(201).json({
    message: "Registered successfully",
  });
};

/* ===================== LOGIN ===================== */
export const login = async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(getFirstZodError(parsed.error), 400);
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });

  // User not registered
  if (!user) {
    return res
      .status(404)
      .json({ message: "User not found. Please register first." });
  }

  // Password invalid
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError("Incorrect password", 401);
  }

  // Generate tokens
  const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: "7d" }
  );

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  res.json({ accessToken, refreshToken });
};

/* ===================== REFRESH TOKEN ===================== */
export const refresh = async (req: Request, res: Response) => {
  const parsed = refreshSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(getFirstZodError(parsed.error), 401);
  }

  const { refreshToken } = parsed.data;

  try {
    const payload = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET!
    ) as { userId: number };

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || user.refreshToken !== refreshToken) {
      throw new AppError("Invalid refresh token", 401);
    }

    const newAccessToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" }
    );

    res.json({ accessToken: newAccessToken });
  } catch {
    throw new AppError("Invalid refresh token", 401);
  }
};

/* ===================== LOGOUT ===================== */
export const logout = async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    throw new AppError("Unauthorized", 401);
  }

  await prisma.user.update({
    where: { id: req.userId },
    data: { refreshToken: null },
  });

  res.json({ message: "Logged out successfully" });
};
