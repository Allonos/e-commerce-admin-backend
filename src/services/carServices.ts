import cloudinary from "../lib/cloudinary";
import prisma from "../lib/prisma";

interface CreateCarData {
  makeId: string;
  typeId: string;
  modelId: string;
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
  makeId?: string;
  typeId?: string;
  modelId?: string;
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

export const getAllAdminsCarsService = async ({
  limit,
  skip,
}: {
  limit: number;
  skip: number;
}) => {
  const [rawCars, totalItems] = await Promise.all([
    prisma.car.findMany({
      include: {
        user: { select: { username: true } },
        make: { select: { id: true, name: true } },
        model: { select: { id: true, name: true } },
        type: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.car.count(),
  ]);

  const cars = rawCars.map(({ userId, user, makeId, modelId, typeId, ...car }) => ({
    ...car,
    owner: { id: userId, username: user.username },
  }));

  return { cars, totalItems };
};

export const createCarService = async ({
  makeId,
  typeId,
  modelId,
  year,
  price,
  location,
  files,
  userId,
  lot,
}: CreateCarData) => {
  if (
    !makeId ||
    !typeId ||
    !modelId ||
    !year ||
    !price ||
    !location ||
    !files ||
    !lot ||
    files.length === 0
  ) {
    throw new Error("All fields are required");
  }

  const existingCarWithLot = await prisma.car.findUnique({
    where: { lot },
  });

  if (existingCarWithLot) {
    throw new Error("A car with this lot already exists");
  }

  const imageUrls = await Promise.all(files.map(uploadToCloudinary));

  return prisma.car.create({
    data: {
      makeId,
      typeId,
      modelId,
      year: parseInt(year),
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
  makeId,
  typeId,
  modelId,
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

  if (lot && lot !== car.lot) {
    const existingCarWithLot = await prisma.car.findUnique({ where: { lot } });
    if (existingCarWithLot) {
      throw new Error("A car with this lot already exists");
    }
  }

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
      ...(makeId !== undefined && { makeId }),
      ...(typeId !== undefined && { typeId }),
      ...(modelId !== undefined && { modelId }),
      ...(year !== undefined && { year: parseInt(year) }),
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
    include: {
      user: { select: { username: true } },
      make: { select: { id: true, name: true } },
      model: { select: { id: true, name: true } },
      type: { select: { id: true, name: true } },
    },
  });

  if (!result) throw new Error("Car not found");

  const { userId, user, makeId, modelId, typeId, ...car } = result;
  return { ...car, owner: { id: userId, username: user.username } };
};

export const getAllMakesService = async () => {
  const makes = await prisma.make.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  return makes;
};

export const createMakeService = async (make: string) => {
  if (!make.trim()) {
    throw new Error("Make is required");
  }
  const existingMakes = await prisma.make.findFirst({
    where: { name: make.trim().toLowerCase() },
    select: { name: true },
  });

  if (existingMakes) {
    throw new Error("Make already exists");
  }

  const newMake = await prisma.make.create({
    data: { name: make.trim().toLowerCase() },
  });
  return newMake;
};

export const getModelsByMakeService = async (makeId: string) => {
  if (!makeId) return [];

  const models = await prisma.model.findMany({
    where: { makeId },
    select: { id: true, name: true, makeId: true },
    orderBy: { name: "asc" },
  });
  return models;
};

export const createModelService = async (model: string, makeId: string) => {
  if (!model.trim()) {
    throw new Error("Model is required");
  }
  if (!makeId) {
    throw new Error("makeId is required");
  }
  const existingModels = await prisma.model.findFirst({
    where: { name: model.trim().toLowerCase(), makeId },
    select: { name: true },
  });

  if (existingModels) {
    throw new Error("Model already exists");
  }

  const newModel = await prisma.model.create({
    data: { name: model.trim().toLowerCase(), makeId },
  });
  return newModel;
};

export const getAllTypesService = async () => {
  const types = await prisma.type.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  return types;
};

export const createTypeService = async (type: string) => {
  if (!type.trim()) {
    throw new Error("Type is required");
  }
  const existingTypes = await prisma.type.findFirst({
    where: { name: type.trim().toLowerCase() },
    select: { name: true },
  });

  if (existingTypes) {
    throw new Error("Type already exists");
  }

  const newType = await prisma.type.create({
    data: { name: type.trim().toLowerCase() },
  });
  return newType;
};
