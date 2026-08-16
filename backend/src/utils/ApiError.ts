import type {
	ApiErrorDetail,
	ApiErrorPayload,
	ErrorCode,
} from "../types/apiError.ts";

const getErrorCodeFromStatus = (statusCode: number): ErrorCode => {
	switch (statusCode) {
		case 400:
			return "BAD_REQUEST";
		case 401:
			return "UNAUTHORIZED";
		case 403:
			return "FORBIDDEN";
		case 404:
			return "NOT_FOUND";
		case 409:
			return "CONFLICT";
		case 422:
			return "UNPROCESSABLE_ENTITY";
		case 500:
			return "INTERNAL_SERVER_ERROR";
		default:
			return "INTERNAL_SERVER_ERROR";
	}
};

class ApiError extends Error {
	public readonly statusCode: number;
	public readonly code: ErrorCode;
	public readonly details: ApiErrorDetail[];

	constructor(
		statusCode: number,
		message = "Something went wrong",
		details: ApiErrorDetail[] = [],
		code: ErrorCode = getErrorCodeFromStatus(statusCode),
		stack?: string,
	) {
		super(message);
		this.statusCode = statusCode;
		this.details = details;
		this.code = code;

		if (stack) {
			this.stack = stack;
		} else {
			Error.captureStackTrace(this, this.constructor);
		}
	}

	toJSON(): ApiErrorPayload {
		return {
			success: false,
			message: this.message,
			error: {
				code: this.code,
				details: this.details,
			},
		};
	}
}

export default ApiError;
