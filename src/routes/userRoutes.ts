import express, { Response } from "express";
import {
  createUser,
  loginUser,
  logoutUser,
} from "../controllers/userControllers";
import { AuthRequest, protectRoute } from "../middleware/protectRoute";

const router = express.Router();

router.post("/create-user", createUser);

router.post("/login", loginUser);

router.post("/logout", protectRoute, logoutUser);

router.get("/check", protectRoute, (req: AuthRequest, res: Response) => {
  res.status(200).json(req.user);
});

export default router;
