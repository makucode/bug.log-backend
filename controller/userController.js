import asyncMiddleware from "../middleware/async.js";
import User from "../models/User.js";

export const createUser = asyncMiddleware(async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    const isExisting = await User.findOne({ email });
    if (isExisting)
        return res.status(409).send("This email is already registered.");

    const newUser = await User.create({
        email,
        firstName,
        lastName,
        password,
    });

    if (!newUser) return res.status(400).send("Bad Request.");

    const token = newUser.generateAuthToken();

    return res.status(201).json({
        _id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        token,
    });
});
