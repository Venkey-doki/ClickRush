import { Router } from "express";
import gameRoutes from "./Game.routes";
import leaderBoardRoutes from "./LeaderBoard.routes";
import profileRoutes from "./Profile.routes";
import authRoutes from "./Auth.routes";

const router = Router();

router.use("/games", gameRoutes);
router.use("/leaderboards", leaderBoardRoutes);
router.use("/users", profileRoutes);
router.use("/auth", authRoutes);

export default router;