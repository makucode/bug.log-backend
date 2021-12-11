import asyncMiddleware from "../middleware/async.js";
import User from "../models/User.js";

// POST /api/auth
// Authenticates user, returns jwt and some user data
// Public access

export const authLogin = asyncMiddleware(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).send("Invalid email or password.");

    const isValid = user.verifyPassword(password);
    if (!isValid) return res.status(401).send("Invalid email or password.");

    const token = user.generateAuthToken();

    return res.status(200).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        token,
    });
});
