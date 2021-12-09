import asyncMiddleware from "../middleware/async.js";
import Comment from "../models/Comment.js";

// GET /api/comments
// Returns comments based on user role or user projects
// Private access

export const getComments = asyncMiddleware(async (req, res) => {
    const { role, projects } = req.user;

    let comments;

    if (role === "admin" || role === "manger") comments = await Comment.find();
    else comments = await Comment.find({ project: { $in: projects } });

    if (!comments) res.status(404).send("No comments found.");

    return res.status(200).json(comments);
});

// POST /api/comments
// Creates a new comment for a specific ticket
// Private access

export const createComment = asyncMiddleware(async (req, res) => {
    const { _id, role, projects } = req.user;
    const { comment, ticket, project } = req.body;

    if (role === "admin" || role === "manager" || projects.includes(project)) {
        const newComment = await Comment.create({
            comment,
            ticket,
            project,
            author: _id,
        });

        return res.status(200).json(newComment);
    }

    return res.status(403).json("Insufficient Permissions");
});

// GET /api/comments/:id
// Returns specific comment by id
// Private access

export const getSingleComment = asyncMiddleware(async (req, res) => {
    const { role, projects } = req.user;

    const comment = await Comment.findById(req.params.id);

    if (role === "admin" || projects.includes(comment.project)) {
        return res.status(200).json(comment);
    }

    return res.status(403).json("Insufficient Permissions");
});

// PUT /api/comments/:id
// Updates specific comment by id
// Private access

export const updateComment = asyncMiddleware(async (req, res) => {
    const { _id, role } = req.user;
    const { comment } = req.body;

    const commentToUpdate = await Comment.findById(req.params.id);

    if (role === "admin" || commentToUpdate.author === _id) {
        comment.comment = comment || comment.comment;

        const updatedComment = await commentToUpdate.save();

        return res.status(200).json(updatedComment);
    }

    return res.status(403).json("Insufficient Permissions");
});

// DELETE /api/comments/:id
// Deletes specific comment by id
// Private access

export const deleteComment = asyncMiddleware(async (req, res) => {
    const { _id, role } = req.user;

    const commentToDelete = await Comment.findById(req.params.id);

    if (role === "admin" || commentToDelete.author === _id) {
        const deletedComment = await commentToDelete.remove();

        return res.status(200).json(deletedComment);
    }

    return res.status(403).json("Insufficient Permissions");
});
