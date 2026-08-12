import asyncRequestHandler from "../utils/AsyncHandler";
import { Router } from "express";
import {
	signup,
	login,
	refreshToken,
	logout,
} from "../controllers/Auth.controller";

const router = Router();

router.post("/signup", asyncRequestHandler(signup));
router.post("/login", asyncRequestHandler(login));
router.post("/refresh-token", asyncRequestHandler(refreshToken));
router.post("/logout", asyncRequestHandler(logout));

export default router;