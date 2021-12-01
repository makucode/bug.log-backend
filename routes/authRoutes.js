import { Router } from "express";
import { authLogin } from "../controller/authController.js";

const authRoutes = Router();

authRoutes.post("/", authLogin);

export default authRoutes;
