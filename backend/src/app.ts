import cors from "cors";
import express from "express";
import { env } from "./config/env";
import globalErrorHandler from "./middlewares/GlobalError.middleware";
import apiRoutes from "./routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
	res.send("Hello, World!");
});

app.use("/api", apiRoutes);

app.use(globalErrorHandler);

app.listen(env.port, () => {
	console.log(`Server is running on port http://localhost:${env.port}`);
});

export default app;