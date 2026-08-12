import { Router } from "express";
import { getLeaderboardHandler } from "../controllers/leaderBoard.controller";
import asyncRequestHandler from "../utils/AsyncHandler";

const router = Router();

router.get("/", asyncRequestHandler(getLeaderboardHandler));

export default router;
