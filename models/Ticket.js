import mongoose from "mongoose";
import User from "./User.js";
import Project from "./Project.js";

const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 55,
    },
    description: {
        type: String,
        required: true,
        maxlength: 255,
        default: "",
    },
    type: {
        type: String,
        required: true,
        maxlength: 7,
        enum: ["Bug", "Error", "UI", "Request"],
    },
    isSolved: {
        type: Boolean,
        required: true,
        default: false,
    },
    priority: {
        type: String,
        required: true,
        enum: ["Critical", "High", "Normal", "Low"],
    },
    addedAt: {
        type: String,
        required: true,
        default: new Date().toLocaleDateString("de-DE", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        }),
        immutable: true,
    },
    addedByName: {
        type: String,
        maxlength: 51,
        default: "",
        immutable: true,
    },
    addedBy_id: {
        type: mongoose.Types.ObjectId,
        required: true,
        immutable: true,
    },
    assignedToName: {
        type: [String],
        default: [],
        required: true,
    },
    assignedTo_id: {
        type: [mongoose.Types.ObjectId],
        default: [],
        required: true,
    },
    project_id: {
        type: mongoose.Types.ObjectId,
        required: true,
        immutable: true,
    },
    projectName: {
        type: String,
        default: "",
    },
    comments: {
        type: [mongoose.Types.ObjectId],
        required: true,
        default: [],
    },
});

ticketSchema.pre("save", async function save(next) {
    if (!this.isModified("addedBy_id")) return next();
    try {
        const user = await User.findById(this.addedBy_id);
        this.addedByName = `${user.firstName} ${user.lastName}`;
        return next();
    } catch (error) {
        return next(error);
    }
});

ticketSchema.pre("save", async function save(next) {
    if (!this.isModified("assignedTo_id")) return next();
    try {
        const updatedUsers = await User.updateMany(
            {
                _id: { $in: this.assignedTo_id },
            },
            { $push: { tickets: this._id } }
        );

        const users = await User.find({ tickets: this._id });

        for (let user of users) {
            if (!this.assignedTo_id.includes(user._id)) {
                user.tickets = user.tickets.filter(
                    (ticket) => ticket !== this._id
                );
                await user.save();
            } else if (
                this.assignedTo_id.includes(user._id) &&
                !user.tickets.includes(this._id)
            ) {
                user.tickets.push(this._id);
                await user.save();
            }
        }

        const members = await User.find({ _id: { $in: this.assignedTo_id } });
        this.assignedToName = members.map(
            (user) => `${user.firstName} ${user.lastName}`
        );
        return next();
    } catch (error) {
        return next(error);
    }
});

ticketSchema.pre("save", async function save(next) {
    if (!this.isModified("project_id")) return next();
    try {
        const project = await Project.findById(this.project_id);
        this.projectName = project.title;
        return next();
    } catch (error) {
        return next(error);
    }
});

const Ticket = new mongoose.model("Ticket", ticketSchema);

export default Ticket;
