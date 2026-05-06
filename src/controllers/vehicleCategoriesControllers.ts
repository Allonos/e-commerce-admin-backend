import { Response } from "express";
import { AuthRequest } from "../middleware/protectRoute";
import {
  createMakeService,
  createModelService,
  createTypeService,
  deleteMakeService,
  deleteModelService,
  deleteTypeService,
  getAllMakesService,
  getAllTypesService,
  getModelsByMakeService,
} from "../services/vehicleCategoriesServices";

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

export const deleteMake = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: "Unauthorized - User is not authenticated" });
    }
    const makeId = req.params.makeId as string;
    const deletedMake = await deleteMakeService(makeId);
    res.json({ message: "Make deleted successfully", deletedMake });
  } catch (error) {
    if (error instanceof Error && error.message === "Make not found") {
      return res.status(404).json({ error: "Make not found" });
    }
    console.error("Error deleting make:", error);
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

export const deleteModel = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: "Unauthorized - User is not authenticated" });
    }
    const { modelId } = req.params as { modelId: string };
    const deletedModel = await deleteModelService(modelId);
    res.json({ message: "Model deleted successfully", deletedModel });
  } catch (error) {
    if (error instanceof Error && error.message === "Model not found") {
      return res.status(404).json({ error: "Model not found" });
    }
    console.error("Error deleting model:", error);
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

export const deleteType = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: "Unauthorized - User is not authenticated" });
    }

    const { typeId } = req.params as { typeId: string };
    const deletedType = await deleteTypeService(typeId);
    res.json({ message: "Type deleted successfully", deletedType });
  } catch (error) {
    if (error instanceof Error && error.message === "Type not found") {
      return res.status(404).json({ error: "Type not found" });
    }
    console.error("Error deleting type:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
