import { GameMode } from "../../generated/prisma/client.ts";

export const GAME_MODE_DURATION_MS: Record<GameMode, number> = {
	CLASSIC_60S: 60000,// 60 seconds
	SPRINT_10S: 10000,// 10 seconds
	MARATHON_120S: 120000,// 120 seconds
};

export const END_SESSION_GRACE_MS = 5000; // 5 seconds grace period after session ends to allow for final click batch processing

export const MAX_HUMAN_CPS = 15;