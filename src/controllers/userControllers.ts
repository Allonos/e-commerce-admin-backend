import { Request, Response } from "express";
import { generateToken } from "../lib/utils";
import {
  banUserService,
  changeAdminRoleService,
  changeUserRoleService,
  createUser as createUserService,
  deleteUserService,
  getAllusersService,
  loginUser as loginUserService,
  unbanUserService,
} from "../services/userServices";
import prisma from "../lib/prisma";
import { parsePagination } from "../lib/pagination";
import { AuthRequest } from "../middleware/protectRoute";

export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long" });
    }

    const newUser = await createUserService(username, email, password);

    generateToken(newUser.id, res);

    res.status(201).json({ user: newUser });
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_IN_USE") {
      return res.status(409).json({ error: "Email already in use" });
    }
    if (error instanceof Error && error.message === "USERNAME_IN_USE") {
      return res.status(409).json({ error: "Username already in use" });
    }
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const user = await loginUserService(email, password);

    generateToken(user.id, res);
    res.json({ user });
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid Credentials") {
      return res.status(401).json({ error: "Invalid Credentials" });
    }
    console.error("Error logging in user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error logging out user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { limit, skip } = parsePagination(req.query);

    const username = req.query.username as string | undefined;
    const role = req.query.role as string | undefined;
    const isBanned = req.query.isBanned as string | undefined;

    const { users, totalUsers } = await getAllusersService({
      limit,
      skip,
      username,
      role,
      isBanned,
    });

    const { page, totalPages, hasNextPage, isFirstPage, isLastPage } =
      parsePagination(req.query, undefined, totalUsers);

    res.status(200).json({
      users,
      totalUsers,
      page,
      totalPages,
      hasNextPage,
      isFirstPage,
      isLastPage,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const changeUserRole = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { userId } = req.params as { userId: string };
    const { role } = req.body;

    const updatedUser = await changeUserRoleService(req.user.id, userId, role);

    res.status(200).json({ user: updatedUser });
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden") {
      return res
        .status(403)
        .json({ error: "You are forbidden from performing this action" });
    }
    console.error("Error changing user role:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const changeAdminRole = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { userId } = req.params as { userId: string };
    const { newAdminRole } = req.body;

    const updatedUser = await changeAdminRoleService(
      req.user.id,
      userId,
      newAdminRole,
    );

    res.status(200).json({ user: updatedUser });
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden") {
      return res
        .status(403)
        .json({ error: "You are forbidden from performing this action" });
    }
    console.error("Error changing admin role:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const banUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { userId } = req.params as { userId: string };
    const { banReason } = req.body;

    const bannedUser = await banUserService(req.user.id, userId, banReason);

    res.status(200).json({ user: bannedUser });
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden") {
      return res
        .status(403)
        .json({ error: "You are forbidden from performing this action" });
    }
    console.error("Error banning user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const cancelBanUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { userId } = req.params as { userId: string };

    const unbannedUser = await unbanUserService(req.user.id, userId);

    res.status(200).json({ user: unbannedUser });
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden") {
      return res
        .status(403)
        .json({ error: "You are forbidden from performing this action" });
    }
    console.error("Error unbanning user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { userId } = req.params as { userId: string };

    await deleteUserService(req.user.id, userId);

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden") {
      return res
        .status(403)
        .json({ error: "You are forbidden from performing this action" });
    }
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
