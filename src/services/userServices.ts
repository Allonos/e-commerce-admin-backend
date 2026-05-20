import bcrypt from "bcrypt";
import prisma from "../lib/prisma";
import { Prisma, UserRole } from "../generated/prisma/client";

const SALT_ROUNDS = 10;

export const createUser = async (
  username: string,
  email: string,
  password: string,
) => {
  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) {
    throw new Error("EMAIL_IN_USE");
  }

  const existingUsername = await prisma.user.findUnique({
    where: { username },
  });
  if (existingUsername) {
    throw new Error("USERNAME_IN_USE");
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const newUser = await prisma.user.create({
    data: { username, email, password: hashedPassword },
  });

  return newUser;
};

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new Error("Invalid Credentials");
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    throw new Error("Invalid Credentials");
  }

  return user;
};

export const getAllusersService = async ({
  limit,
  skip,
  username,
  role,
  isBanned,
}: {
  limit: number;
  skip: number;
  username?: string;
  role?: string;
  isBanned?: string;
}) => {
  const where: Prisma.UserWhereInput = {};

  if (username) {
    where.username = { contains: username, mode: "insensitive" };
  }

  if (role) {
    where.role = role as UserRole;
  }

  if (isBanned) {
    where.isBanned = isBanned === "true";
  }

  const users = await prisma.user.findMany({
    where,
    skip,
    take: limit,
    omit: { password: true },
  });

  const totalUsers = await prisma.user.count({ where });

  return { users, totalUsers };
};

export const changeUserRoleService = async (
  adminId: string,
  userId: string,
  newRole: UserRole,
) => {
  const adminUser = await prisma.user.findUnique({ where: { id: adminId } });
  if (!adminUser || adminUser.adminRole !== "MAIN") {
    throw new Error("Forbidden");
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      role: newRole,
      adminRole: newRole === "ADMIN" ? undefined : null,
    },
  });

  return user;
};

export const changeAdminRoleService = async (
  adminId: string,
  userId: string,
  newAdminRole: "MAIN" | "CONTENT",
) => {
  const adminUser = await prisma.user.findUnique({ where: { id: adminId } });
  if (!adminUser || adminUser.adminRole !== "MAIN") {
    throw new Error("Forbidden");
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { adminRole: newAdminRole },
  });

  return user;
};

export const banUserService = async (
  adminId: string,
  userId: string,
  banReason: string,
) => {
  const adminUser = await prisma.user.findUnique({ where: { id: adminId } });
  if (!adminUser || adminUser.adminRole !== "MAIN") {
    throw new Error("Forbidden");
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      isBanned: true,
      bannedAt: new Date(),
      bannedReason: banReason,
      role: "USER",
      adminRole: null,
    },
  });

  return user;
};

export const unbanUserService = async (adminId: string, userId: string) => {
  const adminUser = await prisma.user.findUnique({ where: { id: adminId } });
  if (!adminUser || adminUser.adminRole !== "MAIN") {
    throw new Error("Forbidden");
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      isBanned: false,
      bannedAt: null,
      bannedReason: null,
    },
  });

  return user;
};

export const deleteUserService = async (adminId: string, userId: string) => {
  const adminUser = await prisma.user.findUnique({ where: { id: adminId } });
  if (!adminUser || adminUser.adminRole !== "MAIN") {
    throw new Error("Forbidden");
  }

  await prisma.user.delete({ where: { id: userId } });
};
