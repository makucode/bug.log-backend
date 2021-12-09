import { Router } from "express";
import {
    createUser,
    deleteUser,
    getSingleUser,
    getUsers,
    updateUser,
} from "../controller/userController.js";
import auth from "../middleware/auth.js";
import admin from "../middleware/admin.js";

const userRoutes = Router();

userRoutes.get("/", auth, getUsers);
userRoutes.post("/", createUser);
userRoutes.get("/:id", auth, getSingleUser);
userRoutes.put("/:id", auth, updateUser);
userRoutes.delete("/:id", [auth, admin], deleteUser);

export default userRoutes;
