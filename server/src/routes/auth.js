import express from "express";
import { login, logout, getCurrentUser } from "../controllers/authController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import rateLimit from "express-rate-limit";

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: {
        message: "Too many login attempts. Please try again later.",
    },
});

const AuthRouter = express.Router();
// AuthRouter.use(authenticate);

AuthRouter.post("/login",loginLimiter, login);
AuthRouter.post("/logout", authenticate, logout);
AuthRouter.get("/me", authenticate, getCurrentUser);

export default AuthRouter;