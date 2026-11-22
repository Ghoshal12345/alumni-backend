import express from "express";

import { getAlumniDirectory, getAlumniProfile } from "../controllers/alumniController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
import { validateAlumniDirectoryQuery, validateAlumniProfileParams } from "../middlewares/alumniValidation.js";

const AlumniRouter = express.Router();

AlumniRouter.use(authenticate, authorizeRoles("STUDENT", "ALUMNI"));

AlumniRouter.get("/", validateAlumniDirectoryQuery, getAlumniDirectory );
AlumniRouter.get("/:libraryId", validateAlumniProfileParams, getAlumniProfile);

export default AlumniRouter;