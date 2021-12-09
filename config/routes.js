import express from "express";
import authRoutes from "../routes/authRoutes.js";
import projectRoutes from "../routes/projectRoutes.js";
import ticketRoutes from "../routes/ticketRoutes.js";
import userRoutes from "../routes/userRoutes.js";
import commentRoutes from "../routes/commentRoutes.js";
import auth from "../middleware/auth.js";

const routes = (app) => {
    app.use(express.json());

    app.get("/", (req, res) => {
        throw new Error("Could not GET /");
    });

    app.use("/api/users", userRoutes);
    app.use("/api/auth", authRoutes);
    app.use("/api/projects", projectRoutes);
    app.use("/api/tickets", ticketRoutes);
    app.use("/api/comments", auth, commentRoutes);
};

export default routes;
