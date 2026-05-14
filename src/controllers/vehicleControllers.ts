import { Response } from "express";
import { AuthRequest } from "../middleware/protectRoute";
import {
  createVehicleService,
  deleteVehicleService,
  getAllAdminsVehiclesService,
  getVehicleByIdService,
  updateVehicleService,
} from "../services/vehicleServices";
import { parsePagination } from "../lib/pagination";

export const getAllAdminsVehicles = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: "Unauthorized - User not authenticated" });
    }

    const { limit, skip } = parsePagination(req.query);
    const makeName = req.query.make as string | undefined;
    const modelName = req.query.model as string | undefined;
    const lotNumber = req.query.lot as string | undefined;
    const typeName = req.query.type as string | undefined;
    const status = req.query.status as string | undefined;
    const transmission = req.query.transmission as string | undefined;
    const condition = req.query.condition as string | undefined;
    const fuelType = req.query.fuelType as string | undefined;
    const featured = req.query.featured as string | undefined;
    const minPrice = req.query.minPrice as string | undefined;
    const maxPrice = req.query.maxPrice as string | undefined;
    const minYear = req.query.minYear as string | undefined;
    const maxYear = req.query.maxYear as string | undefined;
    const minMileage = req.query.minMileage as string | undefined;
    const maxMileage = req.query.maxMileage as string | undefined;
    const minEngine = req.query.minEngine as string | undefined;
    const maxEngine = req.query.maxEngine as string | undefined;
    const sortBy = req.query.sortBy as string | undefined;
    const sortOrder = req.query.sortOrder as string | undefined;

    const { vehicles, totalItems } = await getAllAdminsVehiclesService({
      limit,
      skip,
      makeName,
      modelName,
      lotNumber,
      typeName,
      status,
      transmission,
      condition,
      fuelType,
      featured,
      minPrice,
      maxPrice,
      minYear,
      maxYear,
      minMileage,
      maxMileage,
      minEngine,
      maxEngine,
      sortBy,
      sortOrder,
    });
    const { page, totalPages, hasNextPage, isFirstPage, isLastPage } =
      parsePagination(req.query, undefined, totalItems);
    res.status(200).json({
      vehicles,
      totalItems,
      page,
      totalPages,
      hasNextPage,
      isFirstPage,
      isLastPage,
    });
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createVehicle = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: "Unauthorized - User not authenticated" });
    }

    const {
      makeId,
      typeId,
      modelId,
      year,
      price,
      location,
      lot,
      isFeatured = false,
      priority = 0,
      status = "active",
      mileage = 0,
      engine = 0,
      transmission = "AUTOMATIC",
      condition = "USED",
      fuelType = "GASOLINE",
    } = req.body;
    const files = req.files as Express.Multer.File[];

    if (files.length > 4) {
      return res
        .status(400)
        .json({ error: "Vehicle must have between 1 and 4 images" });
    }

    const newVehicle = await createVehicleService({
      makeId,
      typeId,
      modelId,
      year,
      price,
      location,
      files,
      lot,
      isFeatured,
      priority,
      status,
      userId: req.user.id,
      mileage,
      engine,
      transmission,
      condition,
      fuelType,
    });

    res.status(201).json({ vehicle: newVehicle });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_STATUS") {
      return res
        .status(400)
        .json({ error: "Status must be 'active', 'inactive', or 'sold'" });
    }
    if (error instanceof Error && error.message === "INVALID_TRANSMISSION") {
      return res.status(400).json({ error: "Invalid transmission value" });
    }
    if (error instanceof Error && error.message === "INVALID_CONDITION") {
      return res
        .status(400)
        .json({ error: "Condition must be 'NEW' or 'USED'" });
    }
    if (error instanceof Error && error.message === "INVALID_FUEL_TYPE") {
      return res.status(400).json({ error: "Invalid fuel type value" });
    }
    if (error instanceof Error && error.message === "All fields are required") {
      return res.status(400).json({ error: "All fields are required" });
    }
    if (
      error instanceof Error &&
      error.message === "A vehicle with this lot already exists"
    ) {
      return res
        .status(400)
        .json({ error: "A vehicle with this lot already exists" });
    }
    console.error("Error creating vehicle:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteVehicle = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: "Unauthorized - User is not authenticated" });
    }

    const deletedVehicle = await deleteVehicleService({
      vehicleId: req.params.id as string,
      userId: req.user.id,
    });

    res.json({ message: "Vehicle deleted", deletedVehicle });
  } catch (error) {
    if (error instanceof Error && error.message === "Vehicle not found") {
      return res.status(404).json({ error: "Vehicle not found" });
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return res.status(403).json({ error: "Unauthorized" });
    }
    console.error("Error deleting vehicle:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateVehicle = async (req: AuthRequest, res: Response) => {
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
      isFeatured,
      priority,
      status,
      mileage,
      engine,
      transmission,
      condition,
      fuelType,
    } = req.body;
    const files = req.files as Express.Multer.File[] | undefined;

    const updatedVehicle = await updateVehicleService({
      vehicleId: req.params.id as string,
      userId: req.user.id,
      makeId,
      typeId,
      modelId,
      year,
      location,
      price,
      files,
      existingImages,
      priority,
      lot,
      isFeatured,
      status,
      mileage,
      engine,
      transmission,
      condition,
      fuelType,
    });

    res.json({ vehicle: updatedVehicle });
  } catch (error) {
    if (error instanceof Error && error.message === "Vehicle not found") {
      return res.status(404).json({ error: "Vehicle not found" });
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return res.status(403).json({ error: "Unauthorized" });
    }
    if (error instanceof Error && error.message === "All fields are required") {
      return res.status(400).json({ error: "All fields are required" });
    }
    if (error instanceof Error && error.message === "INVALID_STATUS") {
      return res
        .status(400)
        .json({ error: "Status must be 'active', 'inactive', or 'sold'" });
    }
    if (error instanceof Error && error.message === "INVALID_TRANSMISSION") {
      return res.status(400).json({ error: "Invalid transmission value" });
    }
    if (error instanceof Error && error.message === "INVALID_CONDITION") {
      return res
        .status(400)
        .json({ error: "Condition must be 'NEW' or 'USED'" });
    }
    if (error instanceof Error && error.message === "INVALID_FUEL_TYPE") {
      return res.status(400).json({ error: "Invalid fuel type value" });
    }
    if (error instanceof Error && error.message === "INVALID_IMAGE_COUNT") {
      return res
        .status(400)
        .json({ error: "Vehicle must have between 1 and 4 images" });
    }
    if (
      error instanceof Error &&
      error.message === "A vehicle with this lot already exists"
    ) {
      return res
        .status(400)
        .json({ error: "A vehicle with this lot already exists" });
    }
    console.error("Error updating vehicle:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getVehicleById = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: "Unauthorized - User is not authenticated" });
    }

    const vehicle = await getVehicleByIdService(req.params.id as string);
    res.json({ vehicle });
  } catch (error) {
    if (error instanceof Error && error.message === "Vehicle not found") {
      return res.status(404).json({ error: "Vehicle not found" });
    }
    console.error("Error fetching vehicle:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
