import cloudinary from "../lib/cloudinary";
import prisma from "../lib/prisma";

interface CreateVehicleData {
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

interface UpdateVehicleData {
  vehicleId: string;
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

export const getAllAdminsVehiclesService = async ({
  limit,
  skip,
}: {
  limit: number;
  skip: number;
}) => {
  const [rawVehicles, totalItems] = await Promise.all([
    prisma.vehicle.findMany({
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
    prisma.vehicle.count(),
  ]);

  const vehicles = rawVehicles.map(
    ({ userId, user, makeId, modelId, typeId, ...vehicleFields }) => ({
      ...vehicleFields,
      owner: { id: userId, username: user.username },
    }),
  );

  return { vehicles, totalItems };
};

export const createVehicleService = async ({
  makeId,
  typeId,
  modelId,
  year,
  price,
  location,
  files,
  userId,
  lot,
}: CreateVehicleData) => {
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

  const existingVehicleWithLot = await prisma.vehicle.findUnique({
    where: { lot },
  });

  if (existingVehicleWithLot) {
    throw new Error("A vehicle with this lot already exists");
  }

  const imageUrls = await Promise.all(files.map(uploadToCloudinary));

  return prisma.vehicle.create({
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

export const deleteVehicleService = async ({
  vehicleId,
  userId,
}: {
  vehicleId: string;
  userId: string;
}) => {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });

  if (!vehicle) throw new Error("Vehicle not found");
  if (vehicle.userId !== userId) throw new Error("Unauthorized");

  const deletedVehicle = await prisma.vehicle.delete({
    where: { id: vehicleId },
  });

  if (vehicle.images.length > 0) {
    await Promise.all(
      vehicle.images.map((url) =>
        cloudinary.uploader.destroy(getCloudinaryPublicId(url)),
      ),
    );
  }

  return deletedVehicle;
};

export const updateVehicleService = async ({
  vehicleId,
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
}: UpdateVehicleData) => {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });

  if (!vehicle) throw new Error("Vehicle not found");
  if (vehicle.userId !== userId) throw new Error("Unauthorized");

  if (
    (makeId !== undefined && !makeId) ||
    (typeId !== undefined && !typeId) ||
    (modelId !== undefined && !modelId) ||
    (year !== undefined && !year) ||
    (price !== undefined && !price) ||
    (location !== undefined && !location) ||
    (lot !== undefined && !lot)
  ) {
    throw new Error("All fields are required");
  }

  if (lot && lot !== vehicle.lot) {
    const existingVehicleWithLot = await prisma.vehicle.findUnique({
      where: { lot },
    });
    if (existingVehicleWithLot) {
      throw new Error("A vehicle with this lot already exists");
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

    removedImages = vehicle.images.filter((url) => !keptImages.includes(url));

    const newImageUrls = files?.length
      ? await Promise.all(files.map(uploadToCloudinary))
      : [];

    updatedImages = [...keptImages, ...newImageUrls];

    if (updatedImages.length < 1 || updatedImages.length > 4) {
      throw new Error("INVALID_IMAGE_COUNT");
    }
  }

  const updatedVehicle = await prisma.vehicle.update({
    where: { id: vehicleId },
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

  return updatedVehicle;
};

export const getVehicleByIdService = async (vehicleId: string) => {
  const result = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    include: {
      user: { select: { username: true } },
      make: { select: { id: true, name: true } },
      model: { select: { id: true, name: true } },
      type: { select: { id: true, name: true } },
    },
  });

  if (!result) throw new Error("Vehicle not found");

  const { userId, user, makeId, modelId, typeId, ...vehicle } = result;
  return { ...vehicle, owner: { id: userId, username: user.username } };
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
