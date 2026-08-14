import { prisma } from "../lib/prisma.ts";
import { leaderBoardKeys, redisClient } from "../lib/redis.ts";
import { GameMode } from "../../generated/prisma/client.ts";

const reconstructLeaderboard = async () => {
	for (const mode of Object.values(GameMode)) {
		const bestPerUser = await prisma.score.groupBy({
			by: ["userId"],
			where: {
				mode: mode,
			},
			_max: {
				clickCount: true,
			},
		});

		if (bestPerUser.length <= 0) {
			continue;
		}

		const leaderboard = bestPerUser.map((entry) => ({
			userId: entry.userId,
			clickCount: entry._max.clickCount!,
		}));

        await redisClient.del(leaderBoardKeys.global(mode));
		await redisClient.zadd(
			leaderBoardKeys.global(mode),
			...leaderboard.flatMap((entry) => {
				if (!entry.clickCount) {
					return [0, entry.userId];
				}
				return [entry.clickCount, entry.userId];
			}),
		);
	}

	await prisma.$disconnect();
};

reconstructLeaderboard()
	.then(() => {
		console.log("Leaderboard reconstruction completed.");
		process.exit(0);
	})
	.catch((error) => {
		console.error("Error reconstructing leaderboard:", error);
		process.exit(1);
	});