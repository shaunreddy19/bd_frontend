import { Response } from 'express';
import prisma from '../config/database.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';

export async function getNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { disaster: true },
    });

    res.json(notifications);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch notifications.' });
  }
}

export async function markNotificationAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) {
      res.status(404).json({ error: 'Notification not found.' });
      return;
    }

    if (notification.userId !== userId && req.user!.role !== 'RESCUER') {
      res.status(403).json({ error: 'Unauthorized.' });
      return;
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: {
        status: 'READ',
        readAt: new Date(),
      },
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to mark notification as read.' });
  }
}
