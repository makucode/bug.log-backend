import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 25,
    },
    lastName: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 25,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        minlength: 5,
        maxlength: 255,
    },
    role: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 10,
        default: "pending",
        enum: ["admin", "manager", "developer", "pending"],
    },
    password: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 255,
    },
    projects: {
        type: [mongoose.Types.ObjectId],
        required: true,
        default: [],
    },
    tickets: {
        type: [mongoose.Types.ObjectId],
        required: true,
        default: [],
    },
    registrationDate: {
        type: String,
        required: true,
        default: new Date().toLocaleDateString("de-DE"),
        immutable: true,
    },
});

userSchema.pre("save", async function save(next) {
    if (!this.isModified("password")) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        return next();
    } catch (error) {
        return next(error);
    }
});

userSchema.methods.verifyPassword = async function (inputPassword) {
    return await bcrypt.compare(inputPassword, this.password);
};

userSchema.methods.generateAuthToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            firstName: this.firstName,
            lastName: this.lastName,
        },
        process.env.JWT_SECRET
    );
};

const User = new mongoose.model("User", userSchema);

export default User;
