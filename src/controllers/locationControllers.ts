import { Response } from "express";
import { AuthRequest } from "../middleware/protectRoute";
import {
  getAllCountriesService,
  createCountryService,
  updateCountryService,
  deleteCountryService,
  getAllCitiesService,
  createCityService,
  updateCityService,
  deleteCityService,
} from "../services/locationServices";

export const getAllCountries = async (req: AuthRequest, res: Response) => {
  try {
    const countries = await getAllCountriesService();
    res.json({ countries });
  } catch (error) {
    console.error("Error fetching countries:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createCountry = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: "Unauthorized - User is not authenticated" });
    }
    const { name } = req.body;
    const country = await createCountryService(name);
    res.status(201).json({ country });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Country name is required"
    ) {
      return res.status(400).json({ error: "Country name is required" });
    }
    if (error instanceof Error && error.message === "Country already exists") {
      return res.status(400).json({ error: "Country already exists" });
    }
    console.error("Error creating country:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateCountry = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: "Unauthorized - User is not authenticated" });
    }
    const { countryId } = req.params as { countryId: string };
    const { name } = req.body;
    const country = await updateCountryService(countryId, name);
    res.json({ country });
  } catch (error) {
    if (error instanceof Error && error.message === "Country not found") {
      return res.status(404).json({ error: "Country not found" });
    }
    if (
      error instanceof Error &&
      error.message === "Country name is required"
    ) {
      return res.status(400).json({ error: "Country name is required" });
    }
    if (error instanceof Error && error.message === "Country already exists") {
      return res.status(400).json({ error: "Country already exists" });
    }
    console.error("Error updating country:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteCountry = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: "Unauthorized - User is not authenticated" });
    }
    const { countryId } = req.params as { countryId: string };
    const deletedCountry = await deleteCountryService(countryId);
    res.json({ message: "Country deleted successfully", deletedCountry });
  } catch (error) {
    if (error instanceof Error && error.message === "Country not found") {
      return res.status(404).json({ error: "Country not found" });
    }
    console.error("Error deleting country:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllCities = async (req: AuthRequest, res: Response) => {
  try {
    const countryId = req.query.countryId as string | undefined;
    const cities = await getAllCitiesService(countryId);
    res.json({ cities });
  } catch (error) {
    console.error("Error fetching cities:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createCity = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: "Unauthorized - User is not authenticated" });
    }
    const { name, countryId } = req.body;
    const city = await createCityService(name, countryId);
    res.status(201).json({ city });
  } catch (error) {
    if (error instanceof Error && error.message === "City name is required") {
      return res.status(400).json({ error: "City name is required" });
    }
    if (error instanceof Error && error.message === "countryId is required") {
      return res.status(400).json({ error: "countryId is required" });
    }
    if (error instanceof Error && error.message === "Country not found") {
      return res.status(404).json({ error: "Country not found" });
    }
    if (error instanceof Error && error.message === "City already exists") {
      return res.status(400).json({ error: "City already exists" });
    }
    console.error("Error creating city:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateCity = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: "Unauthorized - User is not authenticated" });
    }
    const { cityId } = req.params as { cityId: string };
    const { name, countryId } = req.body;
    const city = await updateCityService(cityId, name, countryId);
    res.json({ city });
  } catch (error) {
    if (error instanceof Error && error.message === "City not found") {
      return res.status(404).json({ error: "City not found" });
    }
    if (error instanceof Error && error.message === "City name is required") {
      return res.status(400).json({ error: "City name is required" });
    }
    if (error instanceof Error && error.message === "City already exists") {
      return res.status(400).json({ error: "City already exists" });
    }
    if (error instanceof Error && error.message === "Country not found") {
      return res.status(404).json({ error: "Country not found" });
    }
    console.error("Error updating city:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteCity = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: "Unauthorized - User is not authenticated" });
    }
    const { cityId } = req.params as { cityId: string };
    const deletedCity = await deleteCityService(cityId);
    res.json({ message: "City deleted successfully", deletedCity });
  } catch (error) {
    if (error instanceof Error && error.message === "City not found") {
      return res.status(404).json({ error: "City not found" });
    }
    console.error("Error deleting city:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
