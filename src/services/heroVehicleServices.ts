import cloudinary from "../lib/cloudinary";
import prisma from "../lib/prisma";

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

export const getHeroVehiclesService = async () => {
  const heroVehicles = await prisma.hero.findMany();
  return { heroVehicles };
};

export const addHeroVehicleService = async ({
  tagLine,
  subtitle,
  file,
}: {
  tagLine: string;
  subtitle: string;
  file: Express.Multer.File[];
}) => {
  if (!tagLine || !subtitle || !file || file.length === 0) {
    throw new Error("All fields are required");
  }

  const imageUrl = await uploadToCloudinary(file[0]);

  const heroVehicle = await prisma.hero.create({
    data: { tagLine, subtitle, image: imageUrl },
  });

  return { heroVehicle };
};

export const editHeroVehicleService = async ({
  heroId,
  tagLine,
  subtitle,
  file,
}: {
  heroId: string;
  tagLine?: string;
  subtitle?: string;
  file?: Express.Multer.File[];
}) => {
  if (!heroId) throw new Error("Hero vehicle not found");

  if (
    (tagLine !== undefined && !tagLine) ||
    (subtitle !== undefined && !subtitle)
  ) {
    throw new Error("All fields are required");
  }

  const heroVehicle = await prisma.hero.findUnique({ where: { id: heroId } });
  if (!heroVehicle) throw new Error("Hero vehicle not found");

  let updatedImage: string | undefined;

  if (file && file.length > 0) {
    updatedImage = await uploadToCloudinary(file[0]);
    await cloudinary.uploader.destroy(getCloudinaryPublicId(heroVehicle.image));
  }

  const updatedHeroVehicle = await prisma.hero.update({
    where: { id: heroId },
    data: {
      ...(tagLine !== undefined && { tagLine }),
      ...(subtitle !== undefined && { subtitle }),
      ...(updatedImage !== undefined && { image: updatedImage }),
    },
  });

  return { updatedHeroVehicle };
};

export const deleteHeroVehicleService = async ({
  heroId,
}: {
  heroId: string;
}) => {
  const heroVehicle = await prisma.hero.findUnique({ where: { id: heroId } });
  if (!heroVehicle) throw new Error("Hero vehicle not found");

  await cloudinary.uploader.destroy(getCloudinaryPublicId(heroVehicle.image));

  const deletedHeroVehicle = await prisma.hero.delete({
    where: { id: heroId },
  });

  return { deletedHeroVehicle };
};

export const getHeroVehicleByIdService = async ({
  heroId,
}: {
  heroId: string;
}) => {
  const heroVehicle = await prisma.hero.findUnique({ where: { id: heroId } });
  if (!heroVehicle) throw new Error("Hero vehicle not found");

  return { heroVehicle };
};
