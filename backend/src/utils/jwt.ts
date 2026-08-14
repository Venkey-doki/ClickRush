import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.ts";

export interface AccessTokenPayload {
	userId: string;
	username: string;
}

export function signAccessToken(payload: AccessTokenPayload): string {
	const options: SignOptions = {
		expiresIn: env.accessTokenTtl as SignOptions["expiresIn"],
	};
	return jwt.sign(payload, env.jwtAccessSecret, options);
}

export function signRefreshToken(payload: { userId: string }): string {
	const options: SignOptions = {
		expiresIn: env.refreshTokenTtl as SignOptions["expiresIn"],
	};
	return jwt.sign(payload, env.jwtRefreshSecret, options);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
	return jwt.verify(token, env.jwtAccessSecret) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): { userId: string } {
	return jwt.verify(token, env.jwtRefreshSecret) as { userId: string };
}
