import { Response } from "express";
import { AuthRequest } from "../middleware/protectRoute";
import prisma from "../lib/prisma";

export const createCar = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: "Unauthorized - User not authenticated" });
    }

    const { brand, model, year, price, images } = req.body;

    if (!brand || !model || !year || !price || !images) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!Array.isArray(images) || images.length < 1 || images.length > 4) {
      return res
        .status(400)
        .json({ error: "Car must have between 1 and 4 images" });
    }

    const newCar = await prisma.car.create({
      data: {
        brand,
        model,
        year,
        price,
        images,
        userId: req.user.id,
      },
    });

    res.status(201).json({ car: newCar });
  } catch (error) {
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

    const car = await prisma.car.findUnique({
      where: { id: req.params.id as string },
    });

    if (!car) return res.status(404).json({ error: "Car not found" });

    if (car.userId !== req.user.id)
      return res.status(403).json({ error: "Unauthorized" });

    await prisma.car.delete({ where: { id: req.params.id as string } });
    res.json({ message: "Car deleted", car });
  } catch (error) {
    console.error("Error deleting car:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateCar = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized - User is not authenticated" });
    }

    const car = await prisma.car.findUnique({ where: { id: req.params.id as string } });

    if (!car) return res.status(404).json({ error: "Car not found" });

    if (car.userId !== req.user.id)
      return res.status(403).json({ error: "Unauthorized" });

    const { brand, model, year, price, images } = req.body;

    if (images !== undefined && (!Array.isArray(images) || images.length < 1 || images.length > 4)) {
      return res.status(400).json({ error: "Car must have between 1 and 4 images" });
    }

    const updatedCar = await prisma.car.update({
      where: { id: req.params.id as string },
      data: {
        ...(brand !== undefined && { brand }),
        ...(model !== undefined && { model }),
        ...(year !== undefined && { year }),
        ...(price !== undefined && { price }),
        ...(images !== undefined && { images }),
      },
    });

    res.json({ car: updatedCar });
  } catch (error) {
    console.error("Error updating car:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
