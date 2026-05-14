import express from "express";
import { protectRoute } from "../middleware/protectRoute";
import {
  getAllAdminsVehicles,
  createVehicle,
  deleteVehicle,
  updateVehicle,
  getVehicleById,
} from "../controllers/vehicleControllers";
import upload from "../middleware/upload";

const router = express.Router();

/**
 * @swagger
 * /api/vehicles:
 *   get:
 *     summary: Get all vehicles
 *     tags: [Vehicles]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of all vehicles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 vehicles:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Vehicle'
 *                 totalItems:
 *                   type: integer
 *                   description: Total number of vehicles
 *                 page:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 hasNextPage:
 *                   type: boolean
 *                 isFirstPage:
 *                   type: boolean
 *                 isLastPage:
 *                   type: boolean
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
router.get("/", protectRoute, getAllAdminsVehicles);

/**
 * @swagger
 * /api/vehicles/create-vehicle:
 *   post:
 *     summary: Create a new vehicle listing
 *     tags: [Vehicles]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [makeId, typeId, modelId, year, price, location, lot, images]
 *             properties:
 *               makeId:
 *                 type: string
 *                 description: ID of the Make
 *               typeId:
 *                 type: string
 *                 description: ID of the Type
 *               modelId:
 *                 type: string
 *                 description: ID of the Model
 *               year:
 *                 type: integer
 *               price:
 *                 type: string
 *               location:
 *                 type: string
 *               lot:
 *                 type: string
 *               isFeatured:
 *                 type: boolean
 *                 default: false
 *               priority:
 *                 type: integer
 *                 default: 0
 *               status:
 *                 type: string
 *                 enum: [active, inactive, sold]
 *                 default: active
 *               mileage:
 *                 type: integer
 *                 default: 0
 *               engine:
 *                 type: integer
 *                 default: 0
 *               transmission:
 *                 type: string
 *                 enum: [AUTOMATIC, MANUAL, SEMI_AUTOMATIC, CVT]
 *                 default: AUTOMATIC
 *               condition:
 *                 type: string
 *                 enum: [NEW, USED]
 *                 default: USED
 *               fuelType:
 *                 type: string
 *                 enum: [GASOLINE, DIESEL, ELECTRIC, HYBRID, PLUG_IN_HYBRID, LPG, CNG, HYDROGEN]
 *                 default: GASOLINE
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: 1 to 4 images
 *     responses:
 *       201:
 *         description: Vehicle created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 vehicle:
 *                   $ref: '#/components/schemas/Vehicle'
 *       400:
 *         description: Missing fields or too many images
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
  "/create-vehicle",
  upload.array("images", 4),
  protectRoute,
  createVehicle,
);

/**
 *
 * @swagger
 * /api/vehicles/{id}:
 *   get:
 *     summary: Get a vehicle by ID
 *     tags: [Vehicles]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vehicle ID
 *     responses:
 *       200:
 *         description: Vehicle found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 vehicle:
 *                   $ref: '#/components/schemas/Vehicle'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Vehicle not found
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
 *   patch:
 *     summary: Update a vehicle listing
 *     tags: [Vehicles]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vehicle ID
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               makeId:
 *                 type: string
 *                 description: ID of the Make
 *               typeId:
 *                 type: string
 *                 description: ID of the Type
 *               modelId:
 *                 type: string
 *                 description: ID of the Model
 *               year:
 *                 type: integer
 *               price:
 *                 type: string
 *               location:
 *                 type: string
 *               lot:
 *                 type: string
 *               isFeatured:
 *                 type: boolean
 *               priority:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [active, inactive, sold]
 *               mileage:
 *                 type: integer
 *               engine:
 *                 type: integer
 *               transmission:
 *                 type: string
 *                 enum: [AUTOMATIC, MANUAL, SEMI_AUTOMATIC, CVT]
 *               condition:
 *                 type: string
 *                 enum: [NEW, USED]
 *               fuelType:
 *                 type: string
 *                 enum: [GASOLINE, DIESEL, ELECTRIC, HYBRID, PLUG_IN_HYBRID, LPG, CNG, HYDROGEN]
 *               existingImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: URLs of existing images to keep
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: New images to upload (combined with existingImages must be 1–4)
 *     responses:
 *       200:
 *         description: Vehicle updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 vehicle:
 *                   $ref: '#/components/schemas/Vehicle'
 *       400:
 *         description: Invalid image count
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
 *       403:
 *         description: Forbidden - not the owner
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Vehicle not found
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
 *   delete:
 *     summary: Delete a vehicle listing
 *     tags: [Vehicles]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vehicle ID
 *     responses:
 *       200:
 *         description: Vehicle deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Vehicle deleted
 *                 deletedVehicle:
 *                   $ref: '#/components/schemas/Vehicle'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - not the owner
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Vehicle not found
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

router.delete("/:id", protectRoute, deleteVehicle);
router.patch("/:id", upload.array("images", 4), protectRoute, updateVehicle);
router.get("/:id", protectRoute, getVehicleById);

export default router;
