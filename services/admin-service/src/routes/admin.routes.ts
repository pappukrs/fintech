import { Router } from 'express';
import { getDashboard, approveLoan, rejectLoan } from '../controllers/admin.controller';

const router = Router();

// Middleware to check admin role should be here
// router.use(requireAdmin);

router.get('/dashboard', getDashboard);
router.post('/loans/:id/approve', approveLoan);
router.post('/loans/:id/reject', rejectLoan);

export default router;
