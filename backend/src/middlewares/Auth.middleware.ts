import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError";
import { verifyAccessToken } from "../utils/jwt";

export interface AuthenticatedRequest extends Request {
    user?: { userId: string; username: string };
}

export const authenticateToken = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
) => {
    const authHeader = req.headers["authorization"] || req.cookies["token"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        throw new ApiError(401, "Access denied. No token provided.");
    }

    try {
        const decoded = verifyAccessToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        throw new ApiError(401, "Invalid token.");
    }
}