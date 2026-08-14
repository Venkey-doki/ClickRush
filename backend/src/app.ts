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

app.use((req, _res, next) => { 
	//request logger middleware
	console.log("\n new request received")
	//indian time zone
	const indianTime = new Date().toLocaleString("en-IN");
	console.log("Request received at:", indianTime);
	console.log("Request method:", req.method);
	console.log("Request URL:", req.originalUrl);
	console.log("Request body:", req.body);
	console.log("Request query:", req.query);
	console.log("Request params:", req.params);
	next();
})

app.use("/api", apiRoutes);

app.use(globalErrorHandler);

// app.listen(env.port, () => {
// 	console.log(`Server is running on port http://localhost:${env.port}`);
// });

export default app;