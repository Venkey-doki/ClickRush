import { Router } from "express";
import {
	clickBatchHandler,
	endGameSessionHandler,
	startGameSessionHandler,
} from "../controllers/Game.controller";
import { authenticateToken } from "../middlewares/Auth.middleware";
import asyncRequestHandler from "../utils/AsyncHandler";

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
