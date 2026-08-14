import { Router } from "express";
import {
	clickBatchHandler,
	endGameSessionHandler,
	startGameSessionHandler,
} from "../controllers/Game.controller.ts";
import { authenticateToken } from "../middlewares/Auth.middleware.ts";
import asyncRequestHandler from "../utils/AsyncHandler.ts";

const router = Router();

router.post(
	"/start",
	authenticateToken,
	asyncRequestHandler(startGameSessionHandler),
);
router.post(
	"/clicks",
	authenticateToken,
	asyncRequestHandler(clickBatchHandler),
);
router.post(
	"/end",
	authenticateToken,
	asyncRequestHandler(endGameSessionHandler),
);

export default router;
