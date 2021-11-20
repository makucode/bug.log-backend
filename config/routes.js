import express from "express";
import userRoutes from "../routes/userRoutes.js";

const routes = (app) => {
    app.use(express.json());

    app.get("/", (req, res) => {
        throw new Error("Could not GET /");
    });

    app.use("/api/users", userRoutes);
};

export default routes;
