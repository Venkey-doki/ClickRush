import express from "express";
import { env } from "./config/env";
import cors from "cors";
import globalErrorHandler from "./middlewares/GlobalError.middleware";
import authRoutes from "./routes/Auth.routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(globalErrorHandler);

app.get("/health", (req, res) => {
    res.send("Hello, World!");
});

app.use("/api/auth", authRoutes);

app.listen(env.port, () => {
    console.log(`Server is running on port http://localhost:${env.port}`);
});

export default app;