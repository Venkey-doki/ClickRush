import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client.ts";
import { env } from "../config/env.ts";

const globalForPrisma = globalThis as unknown as {
	prisma?: PrismaClient;
};

const adapter = new PrismaPg({
	connectionString: env.databaseUrl,
});

export const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		adapter,
		log: env.nodeEnv === "development" ? ["warn", "error"] : ["error"],
	});

if (env.nodeEnv !== "production") {
	globalForPrisma.prisma = prisma;
}
