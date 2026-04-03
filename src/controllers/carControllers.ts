import { Request, Response } from "express";
import { AuthRequest } from "../middleware/protectRoute";
import prisma from "../lib/prisma";
import cloudinary from "../lib/cloudinary";

const getCloudinaryPublicId = (url: string): string => {
  const afterUpload = url.split("/upload/")[1];
  const withoutVersion = afterUpload.replace(/^v\d+\//, "");
  return withoutVersion.replace(/\.[^/.]+$/, "");
};

export const getAllAdminsCars = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: "Unauthorized - User not authenticated" });
    }

    const cars = await prisma.car.findMany({
      where: { userId: req.user.id },
    });

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

    const { model, year, price, location } = req.body;
    const files = req.files as Express.Multer.File[];

    if (
      !model ||
      !year ||
      !price ||
      !location ||
      !files ||
      files.length === 0
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (files.length > 4) {
      return res
        .status(400)
        .json({ error: "Car must have between 1 and 4 images" });
    }

    const imageUrls = await Promise.all(
      files.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { resource_type: "image" },
              (error, result) => {
                if (error || !result) {
                  reject(error);
                } else {
                  resolve(result.secure_url);
                }
              },
            );
            stream.end(file.buffer);
          }),
      ),
    );

    const newCar = await prisma.car.create({
      data: {
        model,
        year,
        price: parseFloat(price),
        location,
        images: imageUrls,
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

    if (car.images.length > 0) {
      await Promise.all(
        car.images.map((url) =>
          cloudinary.uploader.destroy(getCloudinaryPublicId(url)),
        ),
      );
    }

    res.json({ message: "Car deleted", car });
  } catch (error) {
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

    const car = await prisma.car.findUnique({
      where: { id: req.params.id as string },
    });

    if (!car) return res.status(404).json({ error: "Car not found" });

    if (car.userId !== req.user.id)
      return res.status(403).json({ error: "Unauthorized" });

    const { model, year, location, price, existingImages } = req.body;
    const files = req.files as Express.Multer.File[] | undefined;

    let updatedImages: string[] | undefined;
    let removedImages: string[] = [];

    if (files?.length || existingImages !== undefined) {
      const keptImages: string[] = existingImages
        ? Array.isArray(existingImages)
          ? existingImages
          : [existingImages]
        : [];

      removedImages = car.images.filter((url) => !keptImages.includes(url));

      const newImageUrls = files?.length
        ? await Promise.all(
            files.map(
              (file) =>
                new Promise<string>((resolve, reject) => {
                  const stream = cloudinary.uploader.upload_stream(
                    { resource_type: "image" },
                    (error, result) => {
                      if (error || !result) {
                        reject(error);
                      } else {
                        resolve(result.secure_url);
                      }
                    },
                  );
                  stream.end(file.buffer);
                }),
            ),
          )
        : [];

      updatedImages = [...keptImages, ...newImageUrls];

      if (updatedImages.length < 1 || updatedImages.length > 4) {
        return res
          .status(400)
          .json({ error: "Car must have between 1 and 4 images" });
      }
    }

    const updatedCar = await prisma.car.update({
      where: { id: req.params.id as string },
      data: {
        ...(model !== undefined && { model }),
        ...(year !== undefined && { year }),
        ...(location !== undefined && { location }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(updatedImages !== undefined && { images: updatedImages }),
      },
    });

    if (removedImages.length > 0) {
      await Promise.all(
        removedImages.map((url) =>
          cloudinary.uploader.destroy(getCloudinaryPublicId(url)),
        ),
      );
    }

    res.json({ car: updatedCar });
  } catch (error) {
    console.error("Error updating car:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getCarById = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user)
      return res
        .status(401)
        .json({ error: "Unauthorized - User is not authenticated" });

    const { id } = req.params;
    const car = await prisma.car.findUnique({ where: { id: id as string } });
    if (!car) return res.status(404).json({ error: "Car not found" });

    res.json({ car });
  } catch (error) {
    console.error("Error fetching car:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
