import express from "express";
import {
  addHeroVehicle,
  deleteHeroVehicle,
  editHeroVehicle,
  getHeroVehicles,
  getHeroVehicleById,
} from "../controllers/heroVehicleControllers";
import { protectRoute } from "../middleware/protectRoute";
import upload from "../middleware/upload";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: HeroVehicles
 *   description: Hero vehicle banner management
 */

/**
 * @swagger
 * /api/hero-vehicles/get-hero-vehicles:
 *   get:
 *     summary: Get all hero vehicles
 *     tags: [HeroVehicles]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of all hero vehicles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/HeroVehicle'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/get-hero-vehicles", protectRoute, getHeroVehicles);

/**
 * @swagger
 * /api/hero-vehicles/add-hero-vehicle:
 *   post:
 *     summary: Add a new hero vehicle banner
 *     tags: [HeroVehicles]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [tagLine, subtitle, file]
 *             properties:
 *               tagLine:
 *                 type: string
 *                 description: Hero banner tag line
 *               subtitle:
 *                 type: string
 *                 description: Hero banner subtitle
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Hero banner image
 *     responses:
 *       201:
 *         description: Hero vehicle created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/HeroVehicle'
 *       400:
 *         description: All fields are required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/add-hero-vehicle",
  upload.single("file"),
  protectRoute,
  addHeroVehicle,
);

/**
 * @swagger
 * /api/hero-vehicles/edit-hero-vehicle/{heroId}:
 *   patch:
 *     summary: Edit an existing hero vehicle banner
 *     tags: [HeroVehicles]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: heroId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the hero vehicle to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               tagLine:
 *                 type: string
 *                 description: Updated tag line
 *               subtitle:
 *                 type: string
 *                 description: Updated subtitle
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: New hero banner image (replaces existing)
 *     responses:
 *       200:
 *         description: Hero vehicle updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/HeroVehicle'
 *       400:
 *         description: All fields are required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Hero vehicle not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch(
  "/edit-hero-vehicle/:heroId",
  upload.single("file"),
  protectRoute,
  editHeroVehicle,
);

/**
 * @swagger
 * /api/hero-vehicles/delete-hero-vehicle/{heroId}:
 *   delete:
 *     summary: Delete a hero vehicle banner
 *     tags: [HeroVehicles]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: heroId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the hero vehicle to delete
 *     responses:
 *       200:
 *         description: Hero vehicle deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Hero vehicle deleted
 *                 data:
 *                   $ref: '#/components/schemas/HeroVehicle'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Hero vehicle not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/delete-hero-vehicle/:heroId", protectRoute, deleteHeroVehicle);

/**
 * @swagger
 * /api/hero-vehicles/get-hero-vehicle/{heroId}:
 *   get:
 *     summary: Get a hero vehicle banner by ID
 *     tags: [HeroVehicles]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: heroId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the hero vehicle to retrieve
 *     responses:
 *       200:
 *         description: Hero vehicle found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 heroVehicle:
 *                   $ref: '#/components/schemas/HeroVehicle'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Hero vehicle not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/get-hero-vehicle/:heroId", protectRoute, getHeroVehicleById);

export default router;
