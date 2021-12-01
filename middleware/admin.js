const admin = (req, res, next) => {
    const { role } = req.user;

    if (role !== "admin") {
        return res.status(403).send("Insufficient Permission.");
    }

    next();
};

export default admin;
