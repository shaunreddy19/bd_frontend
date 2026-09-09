import { Router } from 'express';
import {
  createFacility,
  getFacilities,
  getFacilityById,
  updateFacility,
  deleteFacility,
} from '../controllers/facilityController.ts';
import { requireAuth, requireRole } from '../middleware/auth.ts';

const router = Router();

router.post('/facilities', requireAuth, requireRole('RESCUER'), createFacility);
router.get('/facilities', requireAuth, getFacilities);
router.get('/facilities/:id', requireAuth, getFacilityById);
router.put('/facilities/:id', requireAuth, requireRole('RESCUER'), updateFacility);
router.delete('/facilities/:id', requireAuth, requireRole('RESCUER'), deleteFacility);

export default router;
