import express from "express";

import {getProfile, updateProfile } from "../controllers/profileController.js";

import { authenticate } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
import { validateProfileUpdate } from "../middlewares/profileValidation.js";

const ProfileRouter = express.Router();

ProfileRouter.use(authenticate, authorizeRoles("STUDENT", "ALUMNI"));


ProfileRouter.get("/", getProfile);
ProfileRouter.put("/", validateProfileUpdate, updateProfile);

export default ProfileRouter;