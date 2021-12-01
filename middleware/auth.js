import jwt from "jsonwebtoken";
import User from "../models/User.js";

const auth = async (req, res, next) => {
    const token = req.header("x-auth-token");

    if (!token)
        return res.status(401).send("Access denied. No token provided.");

    try {
        const { _id } = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(_id);
        req.user = user;
        if (!req.user) throw new Error("User not Found!");
        next();
    } catch (error) {
        console.log(error);
        return res.status(401).send(error.message);
    }
};

export default auth;
