import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import {
	GameMode,
	PrismaClient,
	SessionStatus,
} from "../generated/prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient({
	adapter: new PrismaPg({
		connectionString: process.env.DATABASE_URL,
	}),
});

const passwordhash = await bcrypt.hash("password123", 10);


const seedUsers = [
	{
		email: "alice@example.com",
		username: "alice",
		passwordHash: passwordhash,
		sessions: [
			{
				mode: GameMode.CLASSIC_60S,
				status: SessionStatus.COMPLETED,
				clickCount: 120,
				durationMs: 60000,
				cps: 2.0,
			},
		],
	},
	{
		email: "bob@example.com",
		username: "bob",
		passwordHash: passwordhash,
		sessions: [
			{
				mode: GameMode.SPRINT_10S,
				status: SessionStatus.COMPLETED,
				clickCount: 42,
				durationMs: 10000,
				cps: 4.2,
			},
		],
	},
	{
		email: "carol@example.com",
		username: "carol",
		passwordHash: passwordhash,
		sessions: [
			{
				mode: GameMode.MARATHON_120S,
				status: SessionStatus.IN_PROGRESS,
				clickCount: 80,
				durationMs: 20000,
				cps: 4.0,
			},
		],
	},
];

async function main() {
	await prisma.$connect();

	for (const seedUser of seedUsers) {
		const user = await prisma.user.upsert({
			where: { email: seedUser.email },
			update: {
				username: seedUser.username,
			},
			create: {
				email: seedUser.email,
				username: seedUser.username,
				passwordHash: seedUser.passwordHash,
			},
		});

		for (const seedSession of seedUser.sessions) {
			const existingSession = await prisma.gameSession.findFirst({
				where: {
					userId: user.id,
					mode: seedSession.mode,
				},
			});

			const session = existingSession
				? existingSession
				: await prisma.gameSession.create({
						data: {
							userId: user.id,
							mode: seedSession.mode,
							status: seedSession.status,
							clickCount: seedSession.clickCount,
							startedAt: new Date(),
							endedAt:
								seedSession.status === SessionStatus.COMPLETED
									? new Date()
									: null,
						},
					});

			const existingScore = await prisma.score.findUnique({
				where: { sessionId: session.id },
			});

			if (!existingScore) {
				await prisma.score.create({
					data: {
						sessionId: session.id,
						userId: user.id,
						mode: seedSession.mode,
						clickCount: seedSession.clickCount,
						durationMs: seedSession.durationMs,
						cps: seedSession.cps,
					},
				});
			}
		}
	}

	console.log("Seed data inserted successfully.");
}

main()
	.catch((error) => {
		console.error("Seed failed", error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
