import { Response } from "express";
import { AuthRequest } from "../middleware/protectRoute";
import {
  addHeroVehicleService,
  deleteHeroVehicleService,
  editHeroVehicleService,
  getHeroVehiclesService,
  getHeroVehicleByIdService,
} from "../services/heroVehicleServices";

export const getHeroVehicles = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No token provided" });
    }

    const { heroVehicles } = await getHeroVehiclesService();

    res.json({ heroVehicles });
  } catch (error) {
    console.error("Error fetching hero vehicles:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addHeroVehicle = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No token provided" });
    }
    const { tagLine, subtitle } = req.body;
    const { heroVehicle } = await addHeroVehicleService({
      tagLine,
      subtitle,
      file: req.file ? [req.file] : [],
    });

    res.status(201).json({ heroVehicle });
  } catch (error) {
    if (error instanceof Error && error.message === "All fields are required") {
      return res.status(400).json({ message: "All fields are required" });
    }
    console.error("Error adding hero vehicle:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const editHeroVehicle = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No token provided" });
    }
    const { heroId } = req.params as { heroId: string };
    const { tagLine, subtitle } = req.body;

    const { updatedHeroVehicle } = await editHeroVehicleService({
      heroId,
      tagLine,
      subtitle,
      file: req.file ? [req.file] : undefined,
    });

    res.json({ updatedHeroVehicle });
  } catch (error) {
    if (error instanceof Error && error.message === "Hero vehicle not found") {
      return res.status(404).json({ message: "Hero vehicle not found" });
    }
    if (error instanceof Error && error.message === "All fields are required") {
      return res.status(400).json({ message: "All fields are required" });
    }
    console.error("Error editing hero vehicle:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteHeroVehicle = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No token provided" });
    }

    const { heroId } = req.params as { heroId: string };
    const { deletedHeroVehicle } = await deleteHeroVehicleService({ heroId });

    res.json({ message: "Hero vehicle deleted", deletedHeroVehicle });
  } catch (error) {
    if (error instanceof Error && error.message === "Hero vehicle not found") {
      return res.status(404).json({ message: "Hero vehicle not found" });
    }
    console.error("Error deleting hero vehicle:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getHeroVehicleById = async (req: AuthRequest, res: Response) => {
  try {
    const { heroId } = req.params as { heroId: string };
    const { heroVehicle } = await getHeroVehicleByIdService({ heroId });

    res.json({ heroVehicle });
  } catch (error) {
    if (error instanceof Error && error.message === "Hero vehicle not found") {
      return res.status(404).json({ message: "Hero vehicle not found" });
    }
    console.error("Error fetching hero vehicle:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
