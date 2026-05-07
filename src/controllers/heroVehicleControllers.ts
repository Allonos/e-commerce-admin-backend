import { Response } from "express";
import { AuthRequest } from "../middleware/protectRoute";
import {
  addHeroVehicleService,
  deleteHeroVehicleService,
  editHeroVehicleService,
} from "../services/heroVehicleServices";

export const addHeroVehicle = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No token provided" });
    }
    const { tagLine, subtitle, file } = req.body;
    const { data } = await addHeroVehicleService({
      tagLine,
      subtitle,
      file,
    });

    res.status(201).json({ data });
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
    const { heroId, tagLine, subtitle, file } = req.body;

    const { data } = await editHeroVehicleService({
      heroId,
      tagLine,
      subtitle,
      file,
    });

    res.json({ data });
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
    const { data } = await deleteHeroVehicleService({ heroId });

    res.json({ message: "Hero vehicle deleted", data });
  } catch (error) {
    if (error instanceof Error && error.message === "Hero vehicle not found") {
      return res.status(404).json({ message: "Hero vehicle not found" });
    }
    console.error("Error deleting hero vehicle:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
