import type { Response } from "express";
import z from "zod";
import type { AuthenticatedRequest } from "../middlewares/Auth.middleware.ts";
import { GameMode } from "../../generated/prisma/client.ts";
import ApiResponse from "../utils/ApiResponse.ts";
import ApiError from "../utils/ApiError.ts";
import {
	startGameSession,
	clickBatch,
	endGameSession,
} from "../services/Game.service.ts";

const startGameSessionSchema = z.object({
	mode: z.enum(GameMode),
});

const clickBatchSchema = z.object({
	sessionId: z.string().uuid(),
	clicks: z.number().int().min(0).max(200),
});

const endGameSessionSchema = z.object({
	sessionId: z.string().uuid(),
});

export const startGameSessionHandler = async (
	req: AuthenticatedRequest,
	res: Response,
) => {
	const { mode } = startGameSessionSchema.parse(req.body);
	const userId = req.user?.userId;

	if (!userId) {
		throw new ApiError(401, "User not authenticated.");
	}

	const sessionData = await startGameSession(userId, mode);

	res.status(201).json(
		new ApiResponse(true, "Game session started.", sessionData),
	);
};

export const clickBatchHandler = async (
    req: AuthenticatedRequest,
    res: Response,
) => {
    const { sessionId, clicks } = clickBatchSchema.parse(req.body);
    const userId = req.user?.userId;

    if (!userId) {
        throw new ApiError(401, "User not authenticated.");
    }

    const totalClicks = await clickBatch(userId, sessionId, clicks);

    res.status(200).json(
        new ApiResponse(true, "Click batch processed.", { totalClicks }),
    );
};

export const endGameSessionHandler = async (
    req: AuthenticatedRequest,
    res: Response,
) => {
    const { sessionId } = endGameSessionSchema.parse(req.body);
    const userId = req.user?.userId;

    if (!userId) {
        throw new ApiError(401, "User not authenticated.");
    }

    const score = await endGameSession(userId, sessionId);

    res.status(200).json(
        new ApiResponse(true, "Game session ended.", { score }),
    );
};