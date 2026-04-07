import bcrypt from "bcrypt";
import prisma from "../lib/prisma";

const SALT_ROUNDS = 10;

export const createUser = async (
  username: string,
  email: string,
  password: string,
) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    throw new Error("EMAIL_IN_USE");
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
