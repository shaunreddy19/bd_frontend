import { Router } from 'express';
import { getNotifications, markNotificationAsRead } from '../controllers/notificationController.ts';
import { requireAuth } from '../middleware/auth.ts';

const router = Router();

router.get('/notifications', requireAuth, getNotifications);
router.put('/notifications/:id/read', requireAuth, markNotificationAsRead);

export default router;
