import { Request, Response } from "express";
import { generateToken } from "../lib/utils";
import {
  createUser as createUserService,
  loginUser as loginUserService,
} from "../services/userServices";

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
