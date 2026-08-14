import Redis from "ioredis";
import { env } from "../config/env.ts";

export const redisClient = new Redis(env.redisUrl, {
	maxRetriesPerRequest: 3,
	lazyConnect: true,
});

await redisClient.set("foo", "bar");

redisClient.on("connect", () => {
    console.log("Redis client connected");
});

redisClient.on("error", (err) => {
    console.error("Redis client error:", err);
});

export const leaderBoardKeys = {
    global: (mode: string) => `lb:global:${mode}`,
    daily: (mode: string, date: string) => `lb:daily:${mode}:${date}`,
    weekly: (mode: string, IsoWeek: string) => `lb:weekly:${mode}:${IsoWeek}`,
};