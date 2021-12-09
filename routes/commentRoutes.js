import { Router } from "express";
import {
    createComment,
    deleteComment,
    getComments,
    getSingleComment,
    updateComment,
} from "../controller/commentController.js";

const commentRoutes = Router();

commentRoutes.get("/", getComments);
commentRoutes.post("/", createComment);
commentRoutes.get("/:id", getSingleComment);
commentRoutes.put("/:id", updateComment);
commentRoutes.delete("/:id", deleteComment);

export default commentRoutes;
