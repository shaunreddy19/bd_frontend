import { Response } from 'express';
import prisma from '../config/database.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';

export async function assignRescueTeam(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { requestId } = req.params;
    const { teamName, notes } = req.body;
    const userId = req.user!.userId;

    if (!teamName) {
      res.status(400).json({ error: 'Team name is required.' });
      return;
    }

    const request = await prisma.emergencyRequest.findUnique({
      where: { id: requestId },
      include: { householdMember: true },
    });

    if (!request) {
      res.status(404).json({ error: 'Emergency request not found.' });
      return;
    }

    const assignment = await prisma.rescueAssignment.create({
      data: {
        emergencyRequestId: requestId,
        teamName: String(teamName).trim(),
        assignedByUserId: userId,
        status: 'TEAM_ASSIGNED',
        notes: notes ? String(notes).trim() : 'Rapid dispatch initialized',
      },
    });

    // Update emergency request rescueStatus
    const updatedRequest = await prisma.emergencyRequest.update({
      where: { id: requestId },
      data: {
        rescueStatus: 'TEAM_ASSIGNED',
      },
      include: {
        conditions: true,
        rescueAssignments: {
          orderBy: { assignedAt: 'desc' },
        },
        householdMember: {
          include: { household: true },
        },
      },
    });

    res.status(201).json({
      message: 'Rescue team successfully assigned',
      assignment,
      request: updatedRequest,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to assign rescue team.' });
  }
}

export async function updateRescueStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { requestId } = req.params;
    const { rescueStatus, notes } = req.body;

    const validStatuses = ['PENDING', 'TEAM_ASSIGNED', 'SAFELY_RESCUED', 'NOT_FOUND'];
    if (!rescueStatus || !validStatuses.includes(rescueStatus)) {
      res.status(400).json({
        error: `Invalid rescue status. Must be one of: ${validStatuses.join(', ')}`,
      });
      return;
    }

    const request = await prisma.emergencyRequest.findUnique({
      where: { id: requestId },
      include: { householdMember: true },
    });

    if (!request) {
      res.status(404).json({ error: 'Emergency request not found.' });
      return;
    }

    // If marked SAFELY_RESCUED, automatically update EmergencyStatus to SAFE!
    if (rescueStatus === 'SAFELY_RESCUED') {
      await prisma.emergencyStatus.upsert({
        where: {
          disasterId_householdMemberId: {
            disasterId: request.disasterId,
            householdMemberId: request.householdMemberId,
          },
        },
        update: {
          status: 'SAFE',
          updatedAt: new Date(),
        },
        create: {
          disasterId: request.disasterId,
          householdMemberId: request.householdMemberId,
          status: 'SAFE',
        },
      });
    }

    const updated = await prisma.emergencyRequest.update({
      where: { id: requestId },
      data: {
        rescueStatus,
      },
      include: {
        conditions: true,
        rescueAssignments: {
          orderBy: { assignedAt: 'desc' },
        },
        householdMember: {
          include: { household: true },
        },
      },
    });

    if (notes) {
      const latestAssignment = await prisma.rescueAssignment.findFirst({
        where: { emergencyRequestId: requestId },
        orderBy: { assignedAt: 'desc' },
      });
      if (latestAssignment) {
        await prisma.rescueAssignment.update({
          where: { id: latestAssignment.id },
          data: {
            status: rescueStatus,
            notes: String(notes).trim(),
          },
        });
      }
    }

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update rescue status.' });
  }
}

export async function getPriorityConfigs(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const configs = await prisma.priorityConfiguration.findMany();
    res.json(configs);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch priority configurations.' });
  }
}

export async function updatePriorityConfig(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { weight, isActive } = req.body;

    const updated = await prisma.priorityConfiguration.update({
      where: { id },
      data: {
        weight: weight !== undefined ? parseInt(weight, 10) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update priority configuration.' });
  }
}
