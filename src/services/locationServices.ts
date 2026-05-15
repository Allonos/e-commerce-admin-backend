import prisma from "../lib/prisma";

export const getAllCountriesService = async () => {
  return prisma.country.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
};

export const createCountryService = async (name: string) => {
  if (!name.trim()) throw new Error("Country name is required");

  const existing = await prisma.country.findUnique({
    where: { name: name.trim() },
  });
  if (existing) throw new Error("Country already exists");

  return prisma.country.create({ data: { name: name.trim() } });
};

export const updateCountryService = async (countryId: string, name: string) => {
  if (!name.trim()) throw new Error("Country name is required");

  const country = await prisma.country.findUnique({ where: { id: countryId } });
  if (!country) throw new Error("Country not found");

  const existing = await prisma.country.findUnique({
    where: { name: name.trim() },
  });
  if (existing && existing.id !== countryId)
    throw new Error("Country already exists");

  return prisma.country.update({
    where: { id: countryId },
    data: { name: name.trim() },
  });
};

export const deleteCountryService = async (countryId: string) => {
  const country = await prisma.country.findUnique({ where: { id: countryId } });
  if (!country) throw new Error("Country not found");

  await prisma.city.deleteMany({ where: { countryId } });

  return prisma.country.delete({ where: { id: countryId } });
};

export const getAllCitiesService = async (countryId?: string) => {
  return prisma.city.findMany({
    where: countryId ? { countryId } : undefined,
    select: {
      id: true,
      name: true,
      countryId: true,
      country: { select: { id: true, name: true } },
    },
    orderBy: { name: "asc" },
  });
};

export const createCityService = async (name: string, countryId: string) => {
  if (!name.trim()) throw new Error("City name is required");
  if (!countryId) throw new Error("countryId is required");

  const country = await prisma.country.findUnique({ where: { id: countryId } });
  if (!country) throw new Error("Country not found");

  const existing = await prisma.city.findUnique({
    where: { name: name.trim() },
  });
  if (existing) throw new Error("City already exists");

  return prisma.city.create({
    data: { name: name.trim(), countryId },
    select: {
      id: true,
      name: true,
      countryId: true,
      country: { select: { id: true, name: true } },
    },
  });
};

export const updateCityService = async (
  cityId: string,
  name?: string,
  countryId?: string,
) => {
  const city = await prisma.city.findUnique({ where: { id: cityId } });
  if (!city) throw new Error("City not found");

  if (name !== undefined && !name.trim())
    throw new Error("City name is required");

  if (name) {
    const existing = await prisma.city.findUnique({
      where: { name: name.trim() },
    });
    if (existing && existing.id !== cityId)
      throw new Error("City already exists");
  }

  if (countryId) {
    const country = await prisma.country.findUnique({
      where: { id: countryId },
    });
    if (!country) throw new Error("Country not found");
  }

  return prisma.city.update({
    where: { id: cityId },
    data: {
      ...(name && { name: name.trim() }),
      ...(countryId && { countryId }),
    },
    select: {
      id: true,
      name: true,
      countryId: true,
      country: { select: { id: true, name: true } },
    },
  });
};

export const deleteCityService = async (cityId: string) => {
  const city = await prisma.city.findUnique({ where: { id: cityId } });
  if (!city) throw new Error("City not found");

  return prisma.city.delete({ where: { id: cityId } });
};
