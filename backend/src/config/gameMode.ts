import { GameMode } from "../../generated/prisma/client";

export const GAME_MODE_DURATION_MS: Record<GameMode, number> = {
	CLASSIC_60S: 60_000,
	SPRINT_10S: 10_000,
	MARATHON_120S: 120_000,
};

export const END_SESSION_GRACE_MS = 2_000;

export const MAX_HUMAN_CPS = 15;