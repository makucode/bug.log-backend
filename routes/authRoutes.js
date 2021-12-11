import { Router } from "express";
import { authLogin, authVerify } from "../controller/authController.js";
import auth from "../middleware/auth.js";

const authRoutes = Router();

authRoutes.post("/", authLogin);
authRoutes.post("/verify", auth, authVerify);

export default authRoutes;
