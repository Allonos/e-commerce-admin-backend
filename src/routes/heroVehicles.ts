import express from "express";
import { addHeroVehicle } from "../controllers/heroVehicleControllers";

const router = express.Router();

router.post("/add-hero-vehicle", addHeroVehicle);
