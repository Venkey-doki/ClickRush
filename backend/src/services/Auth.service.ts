import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import ApiError from "../utils/ApiError";
import {
	signAccessToken,
	signRefreshToken,
	verifyRefreshToken,
} from "../utils/jwt";

const publicUserSelect = {
	id: true,
	email: true,
	username: true,
	createdAt: true,
	updatedAt: true,
	refreshToken: true,
} as const;

const signUp = async (email: string, username: string, password: string) => {
	const existingUser = await prisma.user.findFirst({
		where: { OR: [{ email }, { username }] },
	});

	if (existingUser) {
		throw new ApiError(400, "Email or username already exists");
	}

	const passwordHash = await bcrypt.hash(password, 10);

	const user = await prisma.user.create({
		data: {
			email,
			username,
			passwordHash,
		},
		select: publicUserSelect,
	});

	const tokens = await issueTokens(user.id, user.username);

	await prisma.user.update({
		where: { id: user.id },
		data: { refreshToken: tokens.refreshToken },
	});

	return { user, ...tokens };
};

const logIn = async (loginId: string, password: string) => {
	const user = await prisma.user.findFirst({
		where: { OR: [{ email: loginId }, { username: loginId }] },
	});

	if (!user) {
		throw new ApiError(400, "Invalid email/username or password");
	}

	const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

	if (!isPasswordValid) {
		throw new ApiError(400, "Invalid email/username or password");
	}

	const tokens = await issueTokens(user.id, user.username);

	await prisma.user.update({
		where: { id: user.id },
		data: { refreshToken: tokens.refreshToken },
	});

	const publicUser = {
		id: user.id,
		email: user.email,
		username: user.username,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,
	};

	return { user: publicUser, ...tokens };
};

const refreshTokens = async (refreshToken: string) => {
	let payload: { userId: string };

	try {
		payload = verifyRefreshToken(refreshToken);
	} catch {
		throw new ApiError(401, "Invalid refresh token");
	}

	const user = await prisma.user.findUnique({
		where: { id: payload.userId },
		select: publicUserSelect,
	});

	if (!user || !user.refreshToken) {
		throw new ApiError(401, "Refresh token is missing or invalid");
	}

	try {
		const storedRefreshPayload = verifyRefreshToken(user.refreshToken);
		if (storedRefreshPayload.userId !== payload.userId) {
			throw new ApiError(401, "Refresh token does not match user");
		}
	} catch (error) {
		if (error instanceof ApiError) {
			throw error;
		}
		throw new ApiError(401, "Refresh token has expired");
	}

	if (user.refreshToken !== refreshToken) {
		throw new ApiError(401, "Refresh token does not match");
	}

	const tokens = await issueTokens(user.id, user.username);

	const result = await prisma.user.updateMany({
		where: { id: user.id, refreshToken: user.refreshToken },
		data: { refreshToken: tokens.refreshToken },
	});

	if (result.count !== 1) {
		throw new ApiError(401, "Refresh token has already been rotated");
	}

	return {
		user: {
			id: user.id,
			email: user.email,
			username: user.username,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
		},
		...tokens,
	};
};

const logOut = async (refreshToken: string) => {
	let payload: { userId: string };
	try {
		payload = verifyRefreshToken(refreshToken);
	} catch (err) {
		throw new ApiError(401, "Invalid refresh token");
	}

	await prisma.user.updateMany({
		where: { id: payload.userId, refreshToken: refreshToken },
		data: { refreshToken: null },
	});
};

const issueTokens = async (userId: string, username: string) => {
	const accessToken = signAccessToken({ userId, username });
	const refreshToken = signRefreshToken({ userId });

	return { accessToken, refreshToken };
};

export { logIn, logOut, refreshTokens, signUp };
