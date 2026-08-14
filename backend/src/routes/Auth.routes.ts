import asyncRequestHandler from "../utils/AsyncHandler.ts";
import { Router } from "express";
import {
	signup,
	login,
	refreshToken,
	logout,
} from "../controllers/Auth.controller.ts";

const router = Router();

router.post("/signup", asyncRequestHandler(signup));
router.post("/login", asyncRequestHandler(login));
router.post("/refresh", asyncRequestHandler(refreshToken));
router.post("/logout", asyncRequestHandler(logout));

export default router;