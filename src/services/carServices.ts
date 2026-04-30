import cloudinary from "../lib/cloudinary";
import prisma from "../lib/prisma";

interface CreateCarData {
  makes: string;
  type: string;
  model: string;
  year: string;
  price: string;
  lot: string;
  location: string;
  files: Express.Multer.File[] | undefined;
  userId: string;
}

interface UpdateCarData {
  carId: string;
  userId: string;
  makes?: string;
  type?: string;
  model?: string;
  year?: string;
  location?: string;
  price?: string;
  files?: Express.Multer.File[];
  existingImages?: string | string[];
  lot?: string;
}

const getCloudinaryPublicId = (url: string): string => {
  const afterUpload = url.split("/upload/")[1];
  const withoutVersion = afterUpload.replace(/^v\d+\//, "");
  return withoutVersion.replace(/\.[^/.]+$/, "");
};

const uploadToCloudinary = (file: Express.Multer.File): Promise<string> =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "image" },
      (error, result) => {
        if (error || !result) reject(error);
        else resolve(result.secure_url);
      },
    );
    stream.end(file.buffer);
  });

export const getAllAdminsCarsService = async () => {
  const cars = await prisma.car.findMany({
    include: { user: { select: { username: true } } },
  });

  return cars.map(({ userId, user, ...car }) => ({
    ...car,
    owner: { id: userId, username: user.username },
  }));
};

export const createCarService = async ({
  makes,
  type,
  model,
  year,
  price,
  location,
  files,
  userId,
  lot,
}: CreateCarData) => {
  if (
    !makes ||
    !type ||
    !model ||
    !year ||
    !price ||
    !location ||
    !files ||
    !lot ||
    files.length === 0
  ) {
    throw new Error("All fields are required");
  }

  const imageUrls = await Promise.all(files.map(uploadToCloudinary));

  return prisma.car.create({
    data: {
      makes,
      type,
      model,
      year,
      price: parseFloat(price),
      location,
      images: imageUrls,
      lot,
      userId,
    },
  });
};

export const deleteCarService = async ({
  carId,
  userId,
}: {
  carId: string;
  userId: string;
}) => {
  const car = await prisma.car.findUnique({ where: { id: carId } });

  if (!car) throw new Error("Car not found");
  if (car.userId !== userId) throw new Error("Unauthorized");

  const deletedCar = await prisma.car.delete({ where: { id: carId } });

  if (car.images.length > 0) {
    await Promise.all(
      car.images.map((url) =>
        cloudinary.uploader.destroy(getCloudinaryPublicId(url)),
      ),
    );
  }

  return deletedCar;
};

export const updateCarService = async ({
  carId,
  userId,
  makes,
  type,
  model,
  year,
  location,
  price,
  files,
  lot,
  existingImages,
}: UpdateCarData) => {
  const car = await prisma.car.findUnique({ where: { id: carId } });

  if (!car) throw new Error("Car not found");
  if (car.userId !== userId) throw new Error("Unauthorized");

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
      ? await Promise.all(files.map(uploadToCloudinary))
      : [];

    updatedImages = [...keptImages, ...newImageUrls];

    if (updatedImages.length < 1 || updatedImages.length > 4) {
      throw new Error("INVALID_IMAGE_COUNT");
    }
  }

  const updatedCar = await prisma.car.update({
    where: { id: carId },
    data: {
      ...(makes !== undefined && { makes }),
      ...(type !== undefined && { type }),
      ...(model !== undefined && { model }),
      ...(year !== undefined && { year }),
      ...(location !== undefined && { location }),
      ...(price !== undefined && { price: parseFloat(price) }),
      ...(lot !== undefined && { lot }),
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

  return updatedCar;
};

export const getCarByIdService = async (carId: string) => {
  const result = await prisma.car.findUnique({
    where: { id: carId },
    include: { user: { select: { username: true } } },
  });

  if (!result) throw new Error("Car not found");

  const { userId, user, ...car } = result;
  return { ...car, owner: { id: userId, username: user.username } };
};
