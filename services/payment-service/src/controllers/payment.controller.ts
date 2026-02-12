import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/payment.service';
import { validationResult } from 'express-validator';
import { BadRequestError } from '@platform/common';

export class PaymentController {
    private paymentService: PaymentService;

    constructor() {
        this.paymentService = new PaymentService();
    }

    async init() {
        await this.paymentService.init();
    }

    initiate = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw new BadRequestError('Invalid input data');
            }

            const { userId, loanId, amount, emiId } = req.body;
            const payment = await this.paymentService.initiatePayment(userId, loanId, amount, emiId);

            res.status(201).json({
                status: 'success',
                data: payment
            });
        } catch (err) {
            next(err);
        }
    };

    webhook = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { orderId, status, transactionId, method } = req.body;

            // In a real app, we would validate the webhook signature here
            // For now, we process it directly
            const payment = await this.paymentService.handleWebhook(orderId, status, transactionId, method);

            res.status(200).json({
                status: 'success',
                data: payment
            });
        } catch (err) {
            next(err);
        }
    };

    getPayment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const payment = await this.paymentService.getPayment(req.params.id as string);
            if (!payment) {
                throw new BadRequestError('Payment not found');
            }

            res.json({
                status: 'success',
                data: payment
            });
        } catch (err) {
            next(err);
        }
    };

    getPaymentsByLoan = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const payments = await this.paymentService.getPaymentsByLoan(req.params.loanId as string);
            res.json({
                status: 'success',
                data: payments
            });
        } catch (err) {
            next(err);
        }
    };
}

