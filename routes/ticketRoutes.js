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

ticketRoutes.get("/", getTickets);
ticketRoutes.post("/", createTicket);
ticketRoutes.get("/:id", getSingleTicket);
ticketRoutes.delete("/:id", admin, deleteTicket);
ticketRoutes.put("/:id", updateTicket);

export default ticketRoutes;
