import type { Response } from "express";
import z from "zod";
import type { AuthenticatedRequest } from "../middlewares/Auth.middleware";
import { GameMode } from "../../generated/prisma/client";
import ApiResponse from "../utils/ApiResponse";
import ApiError from "../utils/ApiError";
import { getUserRank } from "../services/Game.service";
import { prisma } from "../lib/prisma";

const rankSchema = z.object({
    mode: z.enum(GameMode),
});

export const getUserRankHandler = async (
    req: AuthenticatedRequest,
    res: Response,
) => {
    const { mode } = rankSchema.parse(req.query);

    const userId = req.user?.userId;

    if (!userId) {
        throw new ApiError(401, "User not authenticated.");
    }

    // Call the service function to get the user's rank
    const todayRank = await getUserRank(userId, mode, "daily");
    const weeklyRank = await getUserRank(userId, mode, "weekly");
    const globalRank = await getUserRank(userId, mode, "global");

    res.status(200).json(
        new ApiResponse(true, "User rank fetched successfully.", {
            mode,
            todayRank,
            weeklyRank,
            globalRank,
        }),
    );
};

export const getUserHistoryHandler = async (
    req: AuthenticatedRequest,
    res: Response,
) => {
    const userId = req.user?.userId;

    if (!userId) {
        throw new ApiError(401, "User not authenticated.");
    }

    // Fetch user history from the database
    const history = await prisma.score.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 50, // Limit to the last 50 sessions
    });

    res.status(200).json(
        new ApiResponse(true, "User history fetched successfully.", {
            history,
        }),
    );
};