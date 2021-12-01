import { Router } from "express";
import auth from "../middleware/auth.js";
import {
    createProject,
    deleteProject,
    getProjects,
    getSingleProject,
    updateProject,
} from "../controller/projectController.js";

const projectRoutes = Router();

projectRoutes.get("/", auth, getProjects);
projectRoutes.post("/", auth, createProject);
projectRoutes.get("/:id", auth, getSingleProject);
projectRoutes.delete("/:id", auth, deleteProject);
projectRoutes.put("/:id", auth, updateProject);

export default projectRoutes;
