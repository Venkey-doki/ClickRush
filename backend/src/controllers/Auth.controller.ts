import z from "zod";
import type { Request, Response } from "express";
import { refreshTokens, signUp, logIn, logOut} from "../services/Auth.service.ts";
import ApiResponse from "../utils/ApiResponse.ts";

const SignUpSchema = z.object({
	email: z.string().email(),
	username: z
		.string()
		.min(3)
		.max(20)
		.regex(/^[a-zA-Z0-9_]+$/, "Alphanumeric + underscore only"),
	password: z.string().min(8).max(72),
});

const LoginSchema = z.object({
	emailOrUsername: z.union([
		z.string().email(),
		z
			.string()
			.min(3)
			.max(20)
			.regex(/^[a-zA-Z0-9_]+$/, "Alphanumeric + underscore only"),
	]),
	password: z.string().min(8).max(72),
});

const RefreshTokenSchema = z.object({
	refreshToken: z.string(),
});

const LogoutSchema = z.object({
    refreshToken: z.string(),
});

export const signup = async (req: Request, res: Response) => {
	const { email, username, password } = SignUpSchema.parse(req.body);
	const { user, accessToken, refreshToken } = await signUp(
		email,
		username,
		password,
	);
	return res
		.status(201)
		.json(
			new ApiResponse(true, "User registered successfully", {
				user,
				accessToken,
				refreshToken,
			}),
		);
};

export const login = async (req: Request, res: Response) => {
	const { emailOrUsername, password } = LoginSchema.parse(req.body);
	const { user, accessToken, refreshToken } = await logIn(
		emailOrUsername,
		password,
	);
	return res
		.status(200)
		.json(
			new ApiResponse(true, "User logged in successfully", {
				user,
				accessToken,
				refreshToken,
			}),
		);
};

export const refreshToken = async (req: Request, res: Response) => {
    const { refreshToken } = RefreshTokenSchema.parse(req.body);
    const { user, accessToken, refreshToken: newRefreshToken } = await refreshTokens(refreshToken);
    return res
        .status(200)
        .json(
            new ApiResponse(true, "Tokens refreshed successfully", {
                user,
                accessToken,
                refreshToken: newRefreshToken,
            }),
        );
};

export const logout = async (req: Request, res: Response) => {
    const { refreshToken } = LogoutSchema.parse(req.body);
    await logOut(refreshToken);
    return res
        .status(200)
        .json(new ApiResponse(true, "User logged out successfully"));
}

export default { signup, login, refreshToken, logout };