import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { env } from "../config/env";
import ApiError from "../utils/ApiError";

const globalErrorHandler: ErrorRequestHandler = (
	err,
	_req,
	res,
	_next,
) => {
	const isDevelopment = env.nodeEnv !== "production";

	let statusCode = 500;
	let message = "Internal Server Error";
	let errors: unknown[] = [];

	if (err instanceof ApiError) {
		statusCode = err.statusCode;
		message = err.message;
		errors = err.errors;
    }

    if(err instanceof ZodError) {
        statusCode = 400;
        message = "Validation Error";
        errors = err.issues.map(e => ({ path: e.path, message: e.message }));
    }

	console.error(err);

	res.status(statusCode).json({
		success: false,
		message,
		errors,
		...(isDevelopment && {
			stack: err.stack,
		}),
	});
};

export default globalErrorHandler;