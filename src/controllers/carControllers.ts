import { Response } from "express";
import { AuthRequest } from "../middleware/protectRoute";
import {
  createCarService,
  deleteCarService,
  getAllAdminsCarsService,
  getCarByIdService,
  updateCarService,
} from "../services/carServices";

export const getAllAdminsCars = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: "Unauthorized - User not authenticated" });
    }

    const cars = await getAllAdminsCarsService();
    res.status(200).json({ cars });
  } catch (error) {
    console.error("Error fetching cars:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createCar = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: "Unauthorized - User not authenticated" });
    }

    const { makes, type, model, year, price, location, lot } = req.body;
    const files = req.files as Express.Multer.File[];

    if (files.length > 4) {
      return res
        .status(400)
        .json({ error: "Car must have between 1 and 4 images" });
    }

    const newCar = await createCarService({
      makes,
      type,
      model,
      year,
      price,
      location,
      files,
      lot,
      userId: req.user.id,
    });

    res.status(201).json({ car: newCar });
  } catch (error) {
    if (error instanceof Error && error.message === "All fields are required") {
      return res.status(400).json({ error: "All fields are required" });
    }
    console.error("Error creating car:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteCar = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: "Unauthorized - User is not authenticated" });
    }

    const deletedCar = await deleteCarService({
      carId: req.params.id as string,
      userId: req.user.id,
    });

    res.json({ message: "Car deleted", deletedCar });
  } catch (error) {
    if (error instanceof Error && error.message === "Car not found") {
      return res.status(404).json({ error: "Car not found" });
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return res.status(403).json({ error: "Unauthorized" });
    }
    console.error("Error deleting car:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateCar = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: "Unauthorized - User is not authenticated" });
    }

    const { makes, type, model, year, location, price, lot, existingImages } =
      req.body;
    const files = req.files as Express.Multer.File[] | undefined;

    const updatedCar = await updateCarService({
      carId: req.params.id as string,
      userId: req.user.id,
      makes,
      type,
      model,
      year,
      location,
      price,
      files,
      existingImages,
      lot,
    });

    res.json({ car: updatedCar });
  } catch (error) {
    if (error instanceof Error && error.message === "Car not found") {
      return res.status(404).json({ error: "Car not found" });
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return res.status(403).json({ error: "Unauthorized" });
    }
    if (error instanceof Error && error.message === "INVALID_IMAGE_COUNT") {
      return res
        .status(400)
        .json({ error: "Car must have between 1 and 4 images" });
    }
    console.error("Error updating car:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getCarById = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: "Unauthorized - User is not authenticated" });
    }

    const car = await getCarByIdService(req.params.id as string);
    res.json({ car });
  } catch (error) {
    if (error instanceof Error && error.message === "Car not found") {
      return res.status(404).json({ error: "Car not found" });
    }
    console.error("Error fetching car:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
