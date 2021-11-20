import { Router } from "express";
import { createUser } from "../controller/userController.js";

const userRoutes = Router();

userRoutes.post("/", createUser);

export default userRoutes;
