import { Response } from "express";
import { AuthRequest } from "../middleware/protectRoute";
import {
  createCarService,
  createMakeService,
  createModelService,
  createTypeService,
  deleteCarService,
  getAllAdminsCarsService,
  getAllMakesService,
  getAllTypesService,
  getCarByIdService,
  getModelsByMakeService,
  updateCarService,
} from "../services/carServices";
import { parsePagination } from "../lib/pagination";

export const getAllAdminsCars = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: "Unauthorized - User not authenticated" });
    }

    const { limit, skip } = parsePagination(req.query);

    const { cars, totalItems } = await getAllAdminsCarsService({ limit, skip });
    const { page, totalPages, hasNextPage, isFirstPage, isLastPage } =
      parsePagination(req.query, undefined, totalItems);
    res
      .status(200)
      .json({ cars, page, totalPages, hasNextPage, isFirstPage, isLastPage });
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

    const { makeId, typeId, modelId, year, price, location, lot } = req.body;
    const files = req.files as Express.Multer.File[];

    if (files.length > 4) {
      return res
        .status(400)
        .json({ error: "Car must have between 1 and 4 images" });
    }

    const newCar = await createCarService({
      makeId,
      typeId,
      modelId,
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
    if (
      error instanceof Error &&
      error.message === "A car with this lot already exists"
    ) {
      return res
        .status(400)
        .json({ error: "A car with this lot already exists" });
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

    const {
      makeId,
      typeId,
      modelId,
      year,
      location,
      price,
      lot,
      existingImages,
    } = req.body;
    const files = req.files as Express.Multer.File[] | undefined;

    const updatedCar = await updateCarService({
      carId: req.params.id as string,
      userId: req.user.id,
      makeId,
      typeId,
      modelId,
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
    if (
      error instanceof Error &&
      error.message === "A car with this lot already exists"
    ) {
      return res
        .status(400)
        .json({ error: "A car with this lot already exists" });
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

export const getAllMakes = async (req: AuthRequest, res: Response) => {
  try {
    const makes = await getAllMakesService();
    res.json({ makes });
  } catch (error) {
    console.error("Error fetching makes:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createMake = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: "Unauthorized - User is not authenticated" });
    }
    const { make } = req.body;
    const newMake = await createMakeService(make);
    res.status(201).json({ make: newMake });
  } catch (error) {
    if (error instanceof Error && error.message === "Make is required") {
      return res.status(400).json({ error: "Make is required" });
    }
    if (error instanceof Error && error.message === "Make already exists") {
      return res.status(400).json({ error: "Make already exists" });
    }
    console.error("Error creating make:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getModelsByMake = async (req: AuthRequest, res: Response) => {
  try {
    const { makeId } = req.query;
    const models = await getModelsByMakeService(makeId as string);
    res.json({ models });
  } catch (error) {
    console.error("Error fetching models:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createModel = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: "Unauthorized - User is not authenticated" });
    }
    const { model, makeId } = req.body;
    const newModel = await createModelService(model, makeId);
    res.status(201).json({ model: newModel });
  } catch (error) {
    if (error instanceof Error && error.message === "Model is required") {
      return res.status(400).json({ error: "Model is required" });
    }
    if (error instanceof Error && error.message === "makeId is required") {
      return res.status(400).json({ error: "makeId is required" });
    }
    if (error instanceof Error && error.message === "Model already exists") {
      return res.status(400).json({ error: "Model already exists" });
    }
    console.error("Error creating model:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllTypes = async (req: AuthRequest, res: Response) => {
  try {
    const types = await getAllTypesService();
    res.json({ types });
  } catch (error) {
    console.error("Error fetching types:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createType = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: "Unauthorized - User is not authenticated" });
    }
    const { type } = req.body;
    const newType = await createTypeService(type);
    res.status(201).json({ type: newType });
  } catch (error) {
    if (error instanceof Error && error.message === "Type is required") {
      return res.status(400).json({ error: "Type is required" });
    }
    if (error instanceof Error && error.message === "Type already exists") {
      return res.status(400).json({ error: "Type already exists" });
    }
    console.error("Error creating type:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
