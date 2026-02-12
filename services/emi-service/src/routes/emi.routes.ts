import { Router } from 'express';
import { EmiController } from '../controllers/emi.controller';
import { validateRequest } from '@platform/common';
import { param, body } from 'express-validator';

const router = Router();

// GET /emis/loan/:loanId
router.get(
    '/loan/:loanId',
    [param('loanId').isUUID().withMessage('Valid Loan ID is required')],
    validateRequest,
    EmiController.getEmisByLoanId
);

// GET /emis/user/:userId
router.get(
    '/user/:userId',
    [param('userId').isUUID().withMessage('Valid User ID is required')],
    validateRequest,
    EmiController.getEmisByUserId
);

// GET /emis/:id
router.get(
    '/:id',
    [param('id').isUUID().withMessage('Valid EMI ID is required')],
    validateRequest,
    EmiController.getEmi
);

// POST /emis/generate (Internal/Test use)
router.post(
    '/generate',
    [
        body('loanId').isUUID(),
        body('userId').isUUID(),
        body('amount').isNumeric(),
        body('tenureMonths').isInt({ min: 1 }),
    ],
    validateRequest,
    EmiController.generateSchedule
);

export default router;
