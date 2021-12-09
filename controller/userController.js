import asyncMiddleware from "../middleware/async.js";
import Project from "../models/Project.js";
import User from "../models/User.js";

// GET /api/users
// Returns all users
// Private access

export const getUsers = asyncMiddleware(async (req, res) => {
    const { role } = req.user;

    let users;

    if (role !== "admin") {
        users = await User.find({
            role: { $in: ["developer", "manager"] },
        }).select("-password");
    } else {
        users = await User.find({}).select("-password");
    }

    if (!users) return res.status(404).send("No users found.");

    return res.status(200).json(users);
});

// POST /api/users
// Creates new user
// Public access

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
        role: newUser.role,
        token,
    });
});

// GET /api/users/:id
// Returns a specific user by id
// Private access, admin or owner only

export const getSingleUser = asyncMiddleware(async (req, res) => {
    const { role } = req.user;

    let user;
    if (role === "admin" || req.user._id === req.params.id) {
        user = await User.findById(req.params.id).select("-password");
    }

    if (!user)
        return res
            .status(400)
            .send("User not found or insufficient permissions");

    return res.status(200).json(user);
});

// PUT /api/users/:id
// Returns a specific user by id
// Private access

export const updateUser = asyncMiddleware(async (req, res) => {
    const { role, _id } = req.user;
    const { firstName, lastName, password, project, email } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send("User not found.");

    let updatedUser;

    if (_id === user._id) {
        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.email = email || user.email;
        if (password) user.password = password;

        updatedUser = await user.save();
    } else if (role === "manager") {
        if (user.projects.includes(project))
            user.projects = user.projects.filter((item) => item !== project);
        else user.projects.push(project);

        updatedUser = await user.save();
    } else if (role === "admin") {
        if (user.projects.includes(project))
            user.projects = user.projects.filter((item) => item !== project);
        else user.projects.push(project);
        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.email = email || user.email;
        user.role = req.body.role || user.role;
        if (password) user.password = password;

        updatedUser = await user.save();
    }

    if (!updatedUser) return res.status(400).send("Bad request.");

    delete updatedUser.password;

    res.status(200).json(updatedUser);
});

// DELETE /api/users/:id
// Returns a specific user by id
// Private access, admin only

export const deleteUser = asyncMiddleware(async (req, res) => {
    const deletedUser = await User.findByIdAndRemove(req.params.id);

    const updatedProjects = await Project.update(
        {
            members: deletedUser._id,
        },
        { $pull: { members: deletedUser._id } }
    );

    const updatedTickets = await Ticket.update(
        {
            assignedTo_id: deletedUser._id,
        },
        { $pull: { assignedTo_id: deletedUser._id } }
    );

    return res.status(200).json(deletedUser);
});
