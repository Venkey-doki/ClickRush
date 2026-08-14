import { Router } from "express";
import { getLeaderboardHandler } from "../controllers/leaderBoard.controller.ts";
import asyncRequestHandler from "../utils/AsyncHandler.ts";

const router = Router();

router.get("/", asyncRequestHandler(getLeaderboardHandler));

export default router;
