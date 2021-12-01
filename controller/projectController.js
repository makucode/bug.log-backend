import asyncMiddleware from "../middleware/async.js";
import Project from "../models/Project.js";
import Ticket from "../models/Ticket.js";
import User from "../models/User.js";

// GET /api/projects
// Returns projects based on user role and project assignment
// Private access

export const getProjects = asyncMiddleware(async (req, res) => {
    const { _id, role } = req.user;

    let selectedProjects;

    switch (role) {
        case "developer":
            selectedProjects = await Project.find({ members: _id });
            break;
        case "pending":
            selectedProjects = [];
            break;
        default:
            selectedProjects = await Project.find({});
            break;
    }

    res.status(200).json(selectedProjects);
});

// POST /api/projects
// Create new project if role is manager or admin
// Private access

export const createProject = asyncMiddleware(async (req, res) => {
    const { title, description, members } = req.body;
    const { _id, role } = req.user;

    if (role !== "admin" && role !== "manager")
        return res.status(403).send("Insufficient Permission.");

    const newProject = await Project.create({
        title,
        description,
        addedBy_id: _id,
        members,
    });

    const users = await User.updateMany(
        { _id: { $in: newProject.members } },
        {
            $push: { projects: newProject._id },
        }
    );

    return res.status(201).json(newProject);
});

// GET /api/projects/:id
// Get specific project by ID
// Private access

export const getSingleProject = asyncMiddleware(async (req, res) => {
    const { _id, role } = req.user;

    if (role === "pending")
        return res.status(403).send("Insufficient Permission.");

    const selectedProject = await Project.findById(req.params.id);

    if (
        role === "manager" ||
        role === "admin" ||
        selectedProject.members.includes(_id)
    )
        return res.status(200).json(selectedProject);

    return res.status(403).send("Insufficient Permission.");
});

// PUT /api/projects/:id
// Update specific project by ID
// Private access

export const updateProject = asyncMiddleware(async (req, res) => {
    const { title, description, members } = req.body;
    const { role } = req.user;

    if (role !== "manager" && role !== "admin")
        return res.status(403).send("Insufficient Permission.");

    const project = await Project.findById(req.params.id);

    project.title = title || project.title;
    project.description = description || project.description;
    project.members = members || project.members;

    const updatedProject = await project.save();

    return res.status(204).send(updatedProject);
});

// DELETE /api/projects/:id
// Delete specific project by ID
// Private access

export const deleteProject = asyncMiddleware(async (req, res) => {
    const { role } = req.user;

    if (role !== "manager" && role !== "admin")
        return res.status(403).send("Insufficient Permission.");

    const deletedProject = await Project.findByIdAndRemove(req.params.id);
    const deletedTickets = await Ticket.deleteMany({
        project_id: deletedProject._id,
    });

    const users = await User.updateMany(
        { _id: { $in: deletedProject.members } },
        {
            $pull: { projects: deletedProject._id },
        }
    );

    return res.status(204).json(deletedProject);
});
