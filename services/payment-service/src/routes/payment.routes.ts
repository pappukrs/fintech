import { Router } from 'express';
import { body } from 'express-validator';
import { PaymentController } from '../controllers/payment.controller';

const router = Router();
const paymentController = new PaymentController();

// We need to export this for app.ts to use and call controller.init()
export const initializeRoutes = async () => {
    await paymentController.init();
};

router.post(
    '/initiate',
    [
        body('userId').isUUID().withMessage('User ID must be a valid UUID'),
        body('loanId').isUUID().withMessage('Loan ID must be a valid UUID'),
        body('amount').isNumeric().withMessage('Amount must be a number'),
    ],
    paymentController.initiate
);

router.post('/webhook', paymentController.webhook);

router.get('/:id', paymentController.getPayment);

router.get('/loan/:loanId', paymentController.getPaymentsByLoan);

export default router;
