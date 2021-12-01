import { Router } from "express";
import auth from "../middleware/auth.js";
import admin from "../middleware/admin.js";
import {
    createTicket,
    deleteTicket,
    getTickets,
    getSingleTicket,
    updateTicket,
} from "../controller/ticketController.js";

const ticketRoutes = Router();

ticketRoutes.get("/", auth, getTickets);
ticketRoutes.post("/", auth, createTicket);
ticketRoutes.get("/:id", auth, getSingleTicket);
ticketRoutes.delete("/:id", [auth, admin], deleteTicket);
ticketRoutes.put("/:id", auth, updateTicket);

export default ticketRoutes;
