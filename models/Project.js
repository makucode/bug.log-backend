import mongoose from "mongoose";
import User from "./User.js";

const projectSchema = new mongoose.Schema({
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
    addedBy: {
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
    tickets: {
        type: [mongoose.Types.ObjectId],
        required: true,
        default: [],
    },
    members: {
        type: [mongoose.Types.ObjectId],
        required: true,
    },
    memberNames: {
        type: [String],
        required: true,
    },
});

projectSchema.pre("save", async function save(next) {
    if (!this.isModified("addedBy_id")) return next();
    try {
        const user = await User.findById(this.addedBy_id);
        this.addedBy = `${user.firstName} ${user.lastName}`;
        return next();
    } catch (error) {
        return next(error);
    }
});

projectSchema.pre("save", async function save(next) {
    if (!this.isModified("members")) return next();
    try {
        const updatedUsers = await User.updateMany(
            {
                _id: { $in: this.members },
            },
            { $push: { projects: this._id } }
        );

        const users = await User.find({ projects: this._id });

        for (let user of users) {
            if (!this.members.includes(user._id)) {
                user.projects = user.projects.filter(
                    (project) => project !== this._id
                );
                await user.save();
            } else if (
                this.members.includes(user._id) &&
                !user.projects.includes(this._id)
            ) {
                user.projects.push(this._id);
                await user.save();
            }
        }

        const members = await User.find({ _id: { $in: this.members } });
        this.memberNames = members.map(
            (user) => `${user.firstName} ${user.lastName}`
        );
        return next();
    } catch (error) {
        return next(error);
    }
});

const Project = new mongoose.model("Project", projectSchema);

export default Project;
