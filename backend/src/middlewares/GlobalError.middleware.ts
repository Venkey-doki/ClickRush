import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { env } from "../config/env.ts";
import type {
	ApiErrorDetail,
	ApiErrorPayload,
	ErrorCode,
} from "../types/apiError.ts";
import ApiError from "../utils/ApiError.ts";

const buildErrorPayload = (
	message: string,
	code: ErrorCode,
	details: ApiErrorDetail[],
): ApiErrorPayload => ({
	success: false,
	message,
	error: {
		code,
		details,
	},
});

const globalErrorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
	const isDevelopment = env.nodeEnv !== "production";

	let statusCode = 500;
	let payload: ApiErrorPayload = buildErrorPayload(
		"Something went wrong. Please try again later.",
		"INTERNAL_SERVER_ERROR",
		[{ message: "Something went wrong. Please try again later." }],
	);

	if (err instanceof ApiError) {
		statusCode = err.statusCode;
		payload = buildErrorPayload(err.message, err.code, err.details);
	}

	if (err instanceof ZodError) {
		statusCode = 400;
		payload = buildErrorPayload(
			"Please check the information you entered and try again.",
			"VALIDATION_ERROR",
			err.issues.map((issue) => ({
				field: issue.path.join(".") || undefined,
				message: issue.message,
			})),
		);
	}

	if (!(err instanceof ApiError) && !(err instanceof ZodError)) {
		payload = buildErrorPayload(
			"Something went wrong. Please try again later.",
			"INTERNAL_SERVER_ERROR",
			[{ message: "Something went wrong. Please try again later." }],
		);
	}

	console.error(err);

	res.status(statusCode).json({
		...payload,
		...(isDevelopment && err instanceof Error && err.stack
			? { stack: err.stack }
			: {}),
	});
};

export default globalErrorHandler;
