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

projectRoutes.get("/", getProjects);
projectRoutes.post("/", createProject);
projectRoutes.get("/:id", getSingleProject);
projectRoutes.delete("/:id", deleteProject);
projectRoutes.put("/:id", updateProject);

export default projectRoutes;
