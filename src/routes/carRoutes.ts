import express from "express";
import { protectRoute } from "../middleware/protectRoute";
import {
  getAllAdminsCars,
  createCar,
  deleteCar,
  updateCar,
} from "../controllers/carControllers";

const router = express.Router();

router.get("/", protectRoute, getAllAdminsCars);
router.post("/create-car", protectRoute, createCar);
router.delete("/:id", protectRoute, deleteCar);
router.patch("/:id", protectRoute, updateCar);

export default router;
