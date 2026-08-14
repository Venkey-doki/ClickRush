import dotenv from "dotenv";
dotenv.config();

function required(name: string, fallback?: string): string {
	const value = process.env[name] ?? fallback;
	if (!value) {
		throw new Error(`Missing required env var: ${name}`);
	}
	return value;
}

export const env = {
	port: parseInt(process.env.PORT ?? "4000", 10),
	nodeEnv: process.env.NODE_ENV ?? "development",
	databaseUrl: required("DATABASE_URL"),
	redisUrl: required("REDIS_URL", "redis://localhost:6379"),
	jwtAccessSecret: required("JWT_ACCESS_SECRET"),
	jwtRefreshSecret: required("JWT_REFRESH_SECRET"),
	accessTokenTtl: process.env.ACCESS_TOKEN_TTL ?? "15m",
	refreshTokenTtl: process.env.REFRESH_TOKEN_TTL ?? "7d",
	corsOrigin:process.env.CORS_ORIGIN ?? "https://click-rush-frontend.vercel.app",
};
