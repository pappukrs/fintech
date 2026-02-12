import { Router } from 'express';
import { body } from 'express-validator';
import { LoanController } from '../controllers/loan.controller';
import { validateRequest } from '@platform/common';

const router = Router();

// POST /loans — Apply for loan
router.post(
    '/',
    [
        body('user_id').isUUID().withMessage('Valid User ID is required'),
        body('amount').isFloat({ min: 1000 }).withMessage('Amount must be at least 1000'),
        body('tenure_months').isInt({ min: 1, max: 60 }).withMessage('Tenure must be between 1 and 60 months'),
        body('interest_rate').isFloat({ min: 0, max: 100 }).withMessage('Interest rate must be valid'),
    ],
    validateRequest,
    LoanController.applyLoan
);

// GET /loans/:id — Get loan details
router.get('/:id', LoanController.getLoan);

// GET /loans/user/:userId — Get user loans
router.get('/user/:userId', LoanController.getLoansByUser);

// POST /loans/:id/approve — Approve loan (Admin)
router.post('/:id/approve', LoanController.approveLoan);

// POST /loans/:id/reject — Reject loan (Admin)
router.post(
    '/:id/reject',
    [
        body('reason').isString().notEmpty().withMessage('Rejection reason is required')
    ],
    validateRequest,
    LoanController.rejectLoan
);

export default router;
