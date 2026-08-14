import type { Response } from "express";
import z from "zod";
import { GameMode } from "../../generated/prisma/client.ts";
import type { AuthenticatedRequest } from "../middlewares/Auth.middleware.ts";
import { getLeaderboard } from "../services/Game.service.ts";
import ApiResponse from "../utils/ApiResponse.ts";

const leaderBoardSchema = z.object({
	mode: z.enum(GameMode),
	period: z.enum(["daily", "weekly", "global"]),
	limit: z.coerce.number().int().min(1).max(100),
});

export const getLeaderboardHandler = async (
	req: AuthenticatedRequest,
	res: Response,
) => {
	const { mode, period, limit } = leaderBoardSchema.parse(req.query);

	const leaderboard = await getLeaderboard(mode, period, limit);

	res.status(200).json(
		new ApiResponse(true, "Leaderboard fetched successfully.", {
			mode,
			period,
			leaderboard,
		}),
	);
};
