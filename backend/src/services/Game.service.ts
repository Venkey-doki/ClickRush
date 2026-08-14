import { GameMode } from "../../generated/prisma/client";
import {
	END_SESSION_GRACE_MS,
	GAME_MODE_DURATION_MS,
	MAX_HUMAN_CPS,
} from "../config/gameMode";
import { prisma } from "../lib/prisma";
import { leaderBoardKeys, redisClient } from "../lib/redis";
import ApiError from "../utils/ApiError";
import {
	isoWeekKey,
	secondsUntilNextUtcDay,
	secondsUntilNextUtcWeek,
	todayKey,
} from "../utils/periodKeys";

const startGameSession = async (userId: string, gameMode: GameMode) => {
	const session = await prisma.gameSession.create({
		data: {
			userId,
			mode: gameMode,
			startedAt: new Date(),
		},
	});

	return {
		sessionId: session.id,
		mode: gameMode,
		startTime: session.startedAt,
		duration: GAME_MODE_DURATION_MS[gameMode],
	};
};

const clickBatch = async (
	userId: string,
	sessionId: string,
	clicks: number,
) => {
	if (clicks < 0 || clicks > 200) {
		throw new ApiError(
			400,
			"Invalid number of clicks. Must be between 0 and 200.",
		);
	}

	const session = await prisma.gameSession.findUnique({
		where: { id: sessionId },
	});

	if (!session) {
		throw new ApiError(404, "Game session not found.");
	}

	if (session.userId !== userId) {
		throw new ApiError(
			403,
			"You do not have permission to modify this session.",
		);
	}

	if (session.status !== "IN_PROGRESS") {
		throw new ApiError(409, "Session is not in progress");
	}

	const now = new Date();
	const elapsedTime = now.getTime() - session.startedAt.getTime();
	const duration = GAME_MODE_DURATION_MS[session.mode];

	if (elapsedTime > duration + END_SESSION_GRACE_MS) {
		throw new ApiError(409, "Session has expired");
	}

	const sinceLastClick = session.lastClickAt
		? now.getTime() - session.lastClickAt.getTime()
		: now.getTime() - session.startedAt.getTime();
	const cps = clicks / Math.max(sinceLastClick / 1000, 0.05); // clicks per second, with a minimum of 0.05 seconds to avoid division by zero

	if (cps > MAX_HUMAN_CPS) {
		await prisma.gameSession.update({
			where: { id: sessionId },
			data: { status: "INVALIDATED" },
		});
		throw new ApiError(422, "Click rate exceeds allowed threshold");
	}

	const updatedSession = await prisma.gameSession.update({
		where: { id: sessionId },
		data: {
			clickCount: { increment: clicks },
			lastClickAt: now,
		},
	});

	return {
		totalClicks: updatedSession.clickCount,
	};
};

const endGameSession = async (userId: string, sessionId: string) => {
	const session = await prisma.gameSession.findUnique({
		where: { id: sessionId },
	});

	if (!session) {
		throw new ApiError(404, "Game session not found.");
	}

	if (session.status === "COMPLETED") {
		const existing = await prisma.score.findUnique({
			where: { sessionId },
		});
		if (existing) return existing;
	}

	if (session.userId !== userId) {
		throw new ApiError(
			403,
			"You do not have permission to modify this session.",
		);
	}

	if (session.status !== "IN_PROGRESS") {
		throw new ApiError(409, "Session is not in progress");
	}

	const now = new Date();
	const elapsedTime = now.getTime() - session.startedAt.getTime();
	const duration = GAME_MODE_DURATION_MS[session.mode];

	if (elapsedTime < duration - END_SESSION_GRACE_MS) {
		throw new ApiError(409, "Session is still in progress");
	}

	const actualDuration = Math.min(
		elapsedTime,
		duration + END_SESSION_GRACE_MS,
	);
	const cps = session.clickCount / (actualDuration / 1000);

	const [, score] = await prisma.$transaction([
		prisma.gameSession.update({
			where: { id: sessionId },
			data: {
				status: "COMPLETED",
				endedAt: now,
				clickCount: session.clickCount,
			},
		}),
		prisma.score.create({
			data: {
				sessionId,
				userId,
				mode: session.mode,
				clickCount: session.clickCount,
				durationMs: duration,
				cps,
			},
		}),
	]);

	// Update Redis leaderboards
	await updateLeaderboards(userId, session.mode, score.clickCount);

	return score;
};

const updateLeaderboards = async (
	userId: string,
	mode: GameMode,
	score: number,
) => {
	const today = todayKey();
	const isoWeek = isoWeekKey();

	//ZADD with GT (only update if new score is greater than existing score)
	await redisClient.zadd(
		leaderBoardKeys.daily(mode, today),
		"GT",
		score,
		userId,
	);
	await redisClient.zadd(
		leaderBoardKeys.weekly(mode, isoWeek),
		"GT",
		score,
		userId,
	);
	await redisClient.zadd(leaderBoardKeys.global(mode), "GT", score, userId);

	// Set expiration for daily and weekly leaderboards
	await redisClient.expire(
		leaderBoardKeys.daily(mode, today),
		secondsUntilNextUtcDay(),
	);
	await redisClient.expire(
		leaderBoardKeys.weekly(mode, isoWeek),
		secondsUntilNextUtcWeek(),
	);
};

const getLeaderboard = async (
	mode: GameMode,
	period: "daily" | "weekly" | "global",
	limit: number = 100,
) => {
	const key =
		period === "daily"
			? leaderBoardKeys.daily(mode, todayKey())
			: period === "weekly"
				? leaderBoardKeys.weekly(mode, isoWeekKey())
				: leaderBoardKeys.global(mode);

	const leaderboard = await redisClient.zrevrange(
		key,
		0,
		limit - 1,
		"WITHSCORES",
	);

	const userIds: string[] = [];
	const scoreByUserId: Record<string, number> = {};

	for (let i = 0; i < leaderboard.length; i += 2) {
		const userId = leaderboard[i];
		const score = leaderboard[i + 1];

		if (userId === undefined || score === undefined) {
			continue;
		}

		userIds.push(userId);
		scoreByUserId[userId] = parseInt(score, 10);
	}

	if (userIds.length === 0) {
		return [];
	}

	const users = await prisma.user.findMany({
		where: { id: { in: userIds } },
		select: { id: true, username: true },
	});

	const userMap = new Map(users.map((user) => [user.id, user.username]));

	return userIds.map((userId, index) => ({
		rank: index + 1,
		userId,
		username: userMap.get(userId) || "Unknown",
		score: scoreByUserId[userId],
	}));
};

const getUserRank = async (
	userId: string,
	mode: GameMode,
	period: "daily" | "weekly" | "global",
) => {
	const key =
		period === "daily"
			? leaderBoardKeys.daily(mode, todayKey())
			: period === "weekly"
				? leaderBoardKeys.weekly(mode, isoWeekKey())
				: leaderBoardKeys.global(mode);

	const rank = await redisClient.zrevrank(key, userId);
	const score = await redisClient.zscore(key, userId);

	if (rank === null || score === null) {
		return null;
	}

	return {
		rank: rank + 1,
		score: parseInt(score, 10),
	};
};

export {
	clickBatch,
	endGameSession,
	getLeaderboard,
	getUserRank,
	startGameSession,
};
