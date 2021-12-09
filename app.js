import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import dbConnect from "./config/db.js";
import routes from "./config/routes.js";
import error from "./middleware/error.js";

dotenv.config();
dbConnect();

const app = express();

app.use(helmet());
app.use(cors());

routes(app);
app.use(error);

//

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log("Server listening on Port: " + PORT));
