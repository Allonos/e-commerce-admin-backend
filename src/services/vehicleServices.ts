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
  isFeatured?: boolean | string;
  priority?: number;
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
  priority?: number;
  lot?: string;
  isFeatured?: boolean | string;
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
  const include = {
    user: { select: { username: true } },
    make: { select: { id: true, name: true } },
    model: { select: { id: true, name: true } },
    type: { select: { id: true, name: true } },
  };

  const [featuredCount, totalItems] = await Promise.all([
    prisma.vehicle.count({ where: { isFeatured: true } }),
    prisma.vehicle.count(),
  ]);

  const featuredSkip = Math.min(skip, featuredCount);
  const featuredTake = Math.min(limit, featuredCount - featuredSkip);
  const nonFeaturedSkip = Math.max(0, skip - featuredCount);
  const nonFeaturedTake = limit - featuredTake;

  const [featuredVehicles, nonFeaturedVehicles] = await Promise.all([
    featuredTake > 0
      ? prisma.vehicle.findMany({
          where: { isFeatured: true },
          include,
          orderBy: { priority: "desc" },
          skip: featuredSkip,
          take: featuredTake,
        })
      : [],
    nonFeaturedTake > 0
      ? prisma.vehicle.findMany({
          where: { isFeatured: false },
          include,
          orderBy: { createdAt: "desc" },
          skip: nonFeaturedSkip,
          take: nonFeaturedTake,
        })
      : [],
  ]);

  const rawVehicles = [...featuredVehicles, ...nonFeaturedVehicles];

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
  isFeatured = false,
  priority = 0,
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

  const isFeaturedBool = isFeatured === true || isFeatured === "true";

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
      isFeatured: isFeaturedBool,
      priority: parseInt(priority.toString()) || 0,
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
  priority,
  existingImages,
  isFeatured,
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

  const isFeaturedBool =
    isFeatured !== undefined
      ? isFeatured === true || isFeatured === "true"
      : undefined;

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
      ...(priority !== undefined && {
        priority: parseInt(priority.toString()) || 0,
      }),
      ...(updatedImages !== undefined && { images: updatedImages }),
      ...(isFeaturedBool !== undefined && { isFeatured: isFeaturedBool }),
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
