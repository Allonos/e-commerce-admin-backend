import prisma from "../lib/prisma";

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

export const deleteMakeService = async (makeId: string) => {
  const make = await prisma.make.findUnique({ where: { id: makeId } });
  if (!make) throw new Error("Make not found");

  await prisma.model.deleteMany({ where: { makeId } });

  const deletedMake = await prisma.make.delete({ where: { id: makeId } });
  return deletedMake;
};

export const getModelsByMakeService = async (makeId?: string) => {
  const models = await prisma.model.findMany({
    where: makeId ? { makeId } : undefined,
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

export const deleteModelService = async (modelId: string) => {
  const model = await prisma.model.findUnique({ where: { id: modelId } });
  if (!model) throw new Error("Model not found");

  const deletedModel = await prisma.model.delete({ where: { id: modelId } });
  return deletedModel;
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

export const deleteTypeService = async (typeId: string) => {
  const type = await prisma.type.findUnique({ where: { id: typeId } });
  if (!type) throw new Error("Type not found");

  const deletedType = await prisma.type.delete({ where: { id: typeId } });
  return deletedType;
};
