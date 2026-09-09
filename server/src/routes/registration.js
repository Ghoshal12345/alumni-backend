import express from "express";
import {requestRegistration, completeRegistration } from "../controllers/registrationController.js";
import {
    requestRegistrationSchema,
    completeRegistrationSchema,
    validate,
} from "../middlewares/registrationValidation.js";

const RegistrationRouter = express.Router();

RegistrationRouter.post("/request", validate(requestRegistrationSchema), requestRegistration);
RegistrationRouter.post("/complete", validate(completeRegistrationSchema), completeRegistration);

export default RegistrationRouter;