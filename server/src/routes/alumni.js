import express from "express";

import { getAlumniDirectory } from "../controllers/alumniController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
import { validateAlumniDirectoryQuery } from "../middlewares/alumniValidation.js";

const AlumniRouter = express.Router();

AlumniRouter.use(authenticate, authorizeRoles("STUDENT", "ALUMNI"));

AlumniRouter.get("/", validateAlumniDirectoryQuery, getAlumniDirectory );

export default AlumniRouter;