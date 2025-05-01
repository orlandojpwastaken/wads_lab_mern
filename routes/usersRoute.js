import express from 'express';
import {signIn, signUp, userInfo} from '../controllers/users.js';
import { auth } from '../middleware/auth.js';

const router = express.Router()

router.get("/user-info", auth, userInfo)

router.post("/signup", signUp)
router.post("/signin", signIn)

export default router