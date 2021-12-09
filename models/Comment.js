import mongoose from "mongoose";
import User from "./User.js";

const commentSchema = new mongoose.Schema({
    comment: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 255,
    },
    ticket: {
        type: mongoose.Types.ObjectId,
        required: true,
        immutable: true,
    },
    project: {
        type: mongoose.Types.ObjectId,
        required: true,
        immutable: true,
    },
    author: {
        type: mongoose.Types.ObjectId,
        required: true,
        immutable: true,
    },
    authorName: {
        type: String,
        minlength: 1,
        maxlength: 255,
    },
    addedAtDate: {
        type: String,
        required: true,
        default: new Date().toLocaleDateString("de-DE", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        }),
        immutable: true,
    },
    addedAtTime: {
        type: String,
        required: true,
        default: new Date().toLocaleTimeString("de-DE", {
            hour: "2-digit",
            minute: "2-digit",
        }),
        immutable: true,
    },
});

commentSchema.pre("save", async function save(next) {
    if (!this.isModified("author")) return next();
    try {
        const user = await User.findById(this.author);
        this.authorName = `${user.firstName} ${user.lastName}`;
        return next();
    } catch (error) {
        return next(error);
    }
});

const Comment = new mongoose.model("Comment", commentSchema);

export default Comment;
