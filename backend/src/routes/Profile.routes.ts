import { Router } from "express";
import {
	getUserHistoryHandler,
	getUserRankHandler,
} from "../controllers/profile.controller.ts";
import { authenticateToken } from "../middlewares/Auth.middleware.ts";
import asyncRequestHandler from "../utils/AsyncHandler.ts";

const router = Router();

router.get(
	"/me/stats",
	authenticateToken,
	asyncRequestHandler(getUserRankHandler),
);
router.get(
	"/me/games",
	authenticateToken,
	asyncRequestHandler(getUserHistoryHandler),
);

export default router;
