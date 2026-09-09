import { Router } from 'express';
import { signup, login, getMe } from '../controllers/authController.ts';
import { requireAuth } from '../middleware/auth.ts';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', requireAuth, getMe);

export default router;
