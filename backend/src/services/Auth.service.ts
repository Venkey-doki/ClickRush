import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";
import ApiError from "../utils/ApiError";
import {
	verifyRefreshToken,
	signAccessToken,
	signRefreshToken,
} from "../utils/jwt";

const publicUserSelect = {
	id: true,
	email: true,
	username: true,
	createdAt: true,
	updatedAt: true,
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
	} catch (err) {
		throw new ApiError(401, "Invalid refresh token");
	}

	const user = await prisma.user.findUnique({
		where: { id: payload.userId },
	});

	if (!user) {
		throw new ApiError(401, "User not found");
	}

	const tokens = await issueTokens(user.id, user.username);

	const publicUser = {
		id: user.id,
		email: user.email,
		username: user.username,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,
	};

	return { user: publicUser, ...tokens };
};

const logOut = async (refreshToken: string) => {
	let payload: { userId: string };
	try {
		payload = verifyRefreshToken(refreshToken);
	} catch (err) {
		throw new ApiError(401, "Invalid refresh token");
	}

	await prisma.user.update({
		where: { id: payload.userId },
		data: { refreshToken: null },
	});
};

const issueTokens = async (userId: string, username: string) => {
	const accessToken = signAccessToken({ userId, username });
	const refreshToken = signRefreshToken({ userId });

	return { accessToken, refreshToken };
};

export { signUp, logIn, refreshTokens, logOut };
