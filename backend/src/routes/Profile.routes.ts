import { Router } from "express";
import {
	getUserHistoryHandler,
	getUserRankHandler,
} from "../controllers/profile.controller";
import { authenticateToken } from "../middlewares/Auth.middleware";
import asyncRequestHandler from "../utils/AsyncHandler";

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
