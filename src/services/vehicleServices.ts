import cloudinary from "../lib/cloudinary";
import prisma from "../lib/prisma";
import { Prisma } from "../generated/prisma/client";

interface CreateVehicleData {
  makeId: string;
  typeId: string;
  modelId: string;
  year: string;
  price: string;
  cityId: string;
  location?: never;
  files: Express.Multer.File[] | undefined;
  userId: string;
  isFeatured?: boolean | string;
  priority?: number;
  status?: string;
  mileage?: number | string;
  engine?: number | string;
  transmission?: string;
  condition?: string;
  fuelType?: string;
}

interface UpdateVehicleData {
  vehicleId: string;
  userId: string;
  makeId?: string;
  typeId?: string;
  modelId?: string;
  year?: string;
  cityId?: string;
  price?: string;
  files?: Express.Multer.File[];
  existingImages?: string | string[];
  priority?: number;
  isFeatured?: boolean | string;
  status?: string;
  mileage?: number | string;
  engine?: number | string;
  transmission?: string;
  condition?: string;
  fuelType?: string;
}

const VALID_STATUSES = ["active", "inactive", "sold"];
const VALID_TRANSMISSIONS = ["AUTOMATIC", "MANUAL", "SEMI_AUTOMATIC", "CVT"];
const VALID_CONDITIONS = ["NEW", "USED"];
const VALID_FUEL_TYPES = [
  "GASOLINE",
  "DIESEL",
  "ELECTRIC",
  "HYBRID",
  "PLUG_IN_HYBRID",
  "LPG",
  "CNG",
  "HYDROGEN",
];

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
  cityName,
  countryName,
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
  sortOrder = "asc",
}: {
  limit: number;
  skip: number;
  cityName?: string;
  countryName?: string;
  makeName?: string;
  modelName?: string;
  lotNumber?: number;
  typeName?: string;
  status?: string;
  transmission?: string;
  condition?: string;
  fuelType?: string;
  featured?: string;
  minPrice?: string;
  maxPrice?: string;
  minYear?: string;
  maxYear?: string;
  minMileage?: string;
  maxMileage?: string;
  minEngine?: string;
  maxEngine?: string;
  sortBy?: string;
  sortOrder?: string;
}) => {
  const include = {
    user: { select: { username: true } },
    make: { select: { id: true, name: true } },
    model: { select: { id: true, name: true } },
    type: { select: { id: true, name: true } },
    city: {
      select: {
        id: true,
        name: true,
        country: { select: { id: true, name: true } },
      },
    },
  };

  const where: Prisma.VehicleWhereInput = {};

  if (cityName || countryName) {
    where.city = {
      ...(cityName && { name: { contains: cityName, mode: "insensitive" } }),
      ...(countryName && {
        country: { name: { contains: countryName, mode: "insensitive" } },
      }),
    };
  }
  if (makeName)
    where.make = { name: { contains: makeName, mode: "insensitive" } };
  if (modelName)
    where.model = { name: { contains: modelName, mode: "insensitive" } };
  if (lotNumber) where.lot = lotNumber;
  if (typeName)
    where.type = { name: { contains: typeName, mode: "insensitive" } };
  if (status) where.status = status;
  if (transmission)
    where.transmission =
      transmission as Prisma.EnumTransmissionFilter<"Vehicle">;
  if (condition)
    where.condition = condition as Prisma.EnumVehicleConditionFilter<"Vehicle">;
  if (fuelType)
    where.fuelType = fuelType as Prisma.EnumFuelTypeFilter<"Vehicle">;
  if (featured) where.isFeatured = featured === "true";
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {
      ...(minPrice !== undefined && { gte: parseFloat(minPrice) }),
      ...(maxPrice !== undefined && { lte: parseFloat(maxPrice) }),
    };
  }
  if (minYear !== undefined || maxYear !== undefined) {
    where.year = {
      ...(minYear !== undefined && { gte: parseInt(minYear) }),
      ...(maxYear !== undefined && { lte: parseInt(maxYear) }),
    };
  }
  if (minMileage !== undefined || maxMileage !== undefined) {
    where.mileage = {
      ...(minMileage !== undefined && { gte: parseInt(minMileage) }),
      ...(maxMileage !== undefined && { lte: parseInt(maxMileage) }),
    };
  }
  if (minEngine !== undefined || maxEngine !== undefined) {
    where.engine = {
      ...(minEngine !== undefined && { gte: parseInt(minEngine) }),
      ...(maxEngine !== undefined && { lte: parseInt(maxEngine) }),
    };
  }

  const VALID_SORT_FIELDS = [
    "year",
    "price",
    "mileage",
    "engine",
    "views",
    "priority",
    "lot",
  ] as const;
  type SortField = (typeof VALID_SORT_FIELDS)[number];
  const order = sortOrder === "desc" ? "desc" : "asc";
  const customSort: Prisma.VehicleOrderByWithRelationInput | null =
    sortBy && (VALID_SORT_FIELDS as readonly string[]).includes(sortBy)
      ? { [sortBy as SortField]: order }
      : null;

  const [featuredCount, totalItems] = await Promise.all([
    prisma.vehicle.count({ where: { ...where, isFeatured: true } }),
    prisma.vehicle.count({ where }),
  ]);

  let rawVehicles;

  if (customSort || where.isFeatured !== undefined) {
    rawVehicles = await prisma.vehicle.findMany({
      where,
      include,
      ...(customSort && { orderBy: customSort }),
      skip,
      take: limit,
    });
  } else {
    const featuredSkip = Math.min(skip, featuredCount);
    const featuredTake = Math.min(limit, featuredCount - featuredSkip);
    const nonFeaturedSkip = Math.max(0, skip - featuredCount);
    const nonFeaturedTake = limit - featuredTake;

    const [featuredVehicles, nonFeaturedVehicles] = await Promise.all([
      featuredTake > 0
        ? prisma.vehicle.findMany({
            where: { ...where, isFeatured: true },
            include,
            orderBy: { priority: "desc" },
            skip: featuredSkip,
            take: featuredTake,
          })
        : [],
      nonFeaturedTake > 0
        ? prisma.vehicle.findMany({
            where: { ...where, isFeatured: false },
            include,
            orderBy: { createdAt: "desc" },
            skip: nonFeaturedSkip,
            take: nonFeaturedTake,
          })
        : [],
    ]);

    rawVehicles = [...featuredVehicles, ...nonFeaturedVehicles];
  }

  const vehicles = rawVehicles.map(
    ({ userId, user, makeId, modelId, typeId, cityId, ...vehicleFields }) => ({
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
  cityId,
  files,
  userId,
  isFeatured = false,
  priority = 0,
  status = "active",
  mileage = 0,
  engine = 0,
  transmission = "AUTOMATIC",
  condition = "USED",
  fuelType = "GASOLINE",
}: CreateVehicleData) => {
  if (
    !makeId ||
    !typeId ||
    !modelId ||
    !year ||
    !price ||
    !cityId ||
    !files ||
    files.length === 0
  ) {
    throw new Error("All fields are required");
  }

  if (!VALID_STATUSES.includes(status!)) {
    throw new Error("INVALID_STATUS");
  }

  if (!VALID_TRANSMISSIONS.includes(transmission as string)) {
    throw new Error("INVALID_TRANSMISSION");
  }

  if (!VALID_CONDITIONS.includes(condition as string)) {
    throw new Error("INVALID_CONDITION");
  }

  if (!VALID_FUEL_TYPES.includes(fuelType as string)) {
    throw new Error("INVALID_FUEL_TYPE");
  }

  const isFeaturedBool = isFeatured === true || isFeatured === "true";

  const imageUrls = await Promise.all(files.map(uploadToCloudinary));

  return prisma.vehicle.create({
    data: {
      makeId,
      typeId,
      modelId,
      year: parseInt(year),
      price: parseFloat(price),
      cityId,
      images: imageUrls,
      userId,
      status,
      isFeatured: isFeaturedBool,
      priority: parseInt(priority.toString()) || 0,
      mileage: parseInt(mileage.toString()) || 0,
      engine: parseInt(engine.toString()) || 0,
      transmission: transmission as any,
      condition: condition as any,
      fuelType: fuelType as any,
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
  cityId,
  price,
  files,
  priority,
  existingImages,
  isFeatured,
  status,
  mileage,
  engine,
  transmission,
  condition,
  fuelType,
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
    (cityId !== undefined && !cityId)
  ) {
    throw new Error("All fields are required");
  }

  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    throw new Error("INVALID_STATUS");
  }

  if (
    transmission !== undefined &&
    !VALID_TRANSMISSIONS.includes(transmission)
  ) {
    throw new Error("INVALID_TRANSMISSION");
  }

  if (condition !== undefined && !VALID_CONDITIONS.includes(condition)) {
    throw new Error("INVALID_CONDITION");
  }

  if (fuelType !== undefined && !VALID_FUEL_TYPES.includes(fuelType)) {
    throw new Error("INVALID_FUEL_TYPE");
  }

  const isFeaturedBool =
    isFeatured !== undefined
      ? isFeatured === true || isFeatured === "true"
      : undefined;

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
      ...(cityId !== undefined && { cityId }),
      ...(price !== undefined && { price: parseFloat(price) }),
      ...(status !== undefined && { status }),
      ...(priority !== undefined && {
        priority: parseInt(priority.toString()) || 0,
      }),
      ...(updatedImages !== undefined && { images: updatedImages }),
      ...(isFeaturedBool !== undefined && { isFeatured: isFeaturedBool }),
      ...(mileage !== undefined && {
        mileage: parseInt(mileage.toString()) || 0,
      }),
      ...(engine !== undefined && { engine: parseInt(engine.toString()) || 0 }),
      ...(transmission !== undefined && { transmission: transmission as any }),
      ...(condition !== undefined && { condition: condition as any }),
      ...(fuelType !== undefined && { fuelType: fuelType as any }),
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
      city: {
        select: {
          id: true,
          name: true,
          country: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!result) throw new Error("Vehicle not found");

  const { userId, user, makeId, modelId, typeId, cityId, ...vehicle } = result;
  return { ...vehicle, owner: { id: userId, username: user.username } };
};
