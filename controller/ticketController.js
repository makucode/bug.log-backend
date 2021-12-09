import asyncMiddleware from "../middleware/async.js";
import Comment from "../models/Comment.js";
import Project from "../models/Project.js";
import Ticket from "../models/Ticket.js";
import User from "../models/User.js";

// GET /api/tickets
// Returns tickets depending on role
// Private access

export const getTickets = asyncMiddleware(async (req, res) => {
    const { role } = req.user;

    let tickets = [];

    if (role === "pending") return res.status(200).json([]);

    if (role === "admin" || role === "manager") tickets = await Ticket.find({});
    else tickets = await Ticket.find({ project: { $in: req.user.projects } });

    return res.status(200).json(tickets);
});

// POST /api/tickets
// Returns tickets depending on role
// Private access

export const createTicket = asyncMiddleware(async (req, res) => {
    const { _id } = req.user;

    const newTicket = await Ticket.create({ ...req.body, addedBy_id: _id });
    const project = await Project.updateOne(
        { id: newTicket.project_id },
        { $push: { tickets: newTicket._id } }
    );

    res.status(201).json(newTicket);
});

// GET /api/tickets/:id
// Returns ticket depending on role
// Private access

export const getSingleTicket = asyncMiddleware(async (req, res) => {
    const { tickets } = req.user;

    if (
        (role !== "admin" && role !== "manager") ||
        !tickets.includes(req.params.id)
    ) {
        throw new Error("Insufficient Permissions");
    }

    const ticket = await Ticket.findById(req.params.id);
    return res.status(200).send(ticket);
});

// PUT /api/tickets/:id
// Updates ticket by id
// Private access

export const updateTicket = asyncMiddleware(async (req, res) => {
    const {
        isSolved,
        description,
        title,
        type,
        priority,
        assignedTo_id,
        comments,
    } = req.body;

    const { role, tickets } = req.user;

    if (
        !tickets.includes(req.params.id) &&
        role !== "admin" &&
        role !== "manager"
    )
        return res.status(403).send("Insufficient Permissions");

    const ticket = await Ticket.findById(req.params.id);

    ticket.title = title || ticket.title;
    ticket.description = description || ticket.description;
    ticket.priority = priority || ticket.priority;
    ticket.type = type || ticket.type;
    ticket.comments = comments || ticket.comments;
    if (typeof isSolved !== "undefined" && isSolved !== null)
        ticket.isSolved = isSolved;
    if (role === "admin" || role === "manager")
        ticket.assignedTo_id = assignedTo_id || ticket.assignedTo_id;

    const updatedTicket = await ticket.save();

    res.status(200).json(updatedTicket);
});

// DELETE /api/tickets/:id
// Deletes ticket by id
// Private access, admin and manager only

export const deleteTicket = asyncMiddleware(async (req, res) => {
    const deletedTicket = await Ticket.findByIdAndRemove(req.params.id);

    const users = await User.updateMany(
        { _id: { $in: deletedTicket.assignedTo_id } },
        {
            $pull: { tickets: deletedTicket._id },
        }
    );

    const projects = await Project.updateMany(
        { _id: deletedTicket.project_id },
        {
            $pull: { tickets: deletedTicket._id },
        }
    );

    const deletedComments = await Comment.deleteMany({
        ticket: deletedTicket._id,
    });

    return res.status(204).json(deletedTicket);
});
