import { Router } from 'express';
import {
  getEmergencyRequestById,
  updateEmergencyRequest,
} from '../controllers/emergencyController.ts';
import {
  assignRescueTeam,
  updateRescueStatus,
  getPriorityConfigs,
  updatePriorityConfig,
} from '../controllers/rescueController.ts';
import { requireAuth, requireRole } from '../middleware/auth.ts';

const router = Router();

// Single emergency request lookup and edits
router.get('/emergency-requests/:requestId', requireAuth, getEmergencyRequestById);
router.put('/emergency-requests/:requestId', requireAuth, updateEmergencyRequest);

// Rescue assignment and status lifecycle (Rescuer only)
router.post('/emergency-requests/:requestId/assign', requireAuth, requireRole('RESCUER'), assignRescueTeam);
router.put('/emergency-requests/:requestId/rescue-status', requireAuth, requireRole('RESCUER'), updateRescueStatus);

// Priority configuration
router.get('/priority-config', requireAuth, getPriorityConfigs);
router.put('/priority-config/:id', requireAuth, requireRole('RESCUER'), updatePriorityConfig);

export default router;
