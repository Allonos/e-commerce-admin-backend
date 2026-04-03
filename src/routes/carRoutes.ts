import express from "express";
import { protectRoute } from "../middleware/protectRoute";
import {
  getAllAdminsCars,
  createCar,
  deleteCar,
  updateCar,
  getCarById,
} from "../controllers/carControllers";
import upload from "../middleware/upload";

const router = express.Router();

router.get("/", protectRoute, getAllAdminsCars);
router.post("/create-car", upload.array("images", 4), protectRoute, createCar);
router.delete("/:id", protectRoute, deleteCar);
router.patch("/:id", upload.array("images", 4), protectRoute, updateCar);
router.get("/:id", protectRoute, getCarById);

export default router;
