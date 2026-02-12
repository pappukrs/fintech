import { Request, Response, NextFunction } from 'express';
import { EmiService } from '../services/emi.service';
import { successResponse, BadRequestError, NotFoundError } from '@platform/common';

const emiService = new EmiService();

export class EmiController {
    /**
     * GET /emis/loan/:loanId
     * Get EMI schedule for a loan
     */
    static async getEmisByLoanId(req: Request, res: Response, next: NextFunction) {
        try {
            const loanId = req.params.loanId as string;
            const emis = await emiService.getEmisByLoanId(loanId);

            return successResponse(res, emis, 'EMI schedule retrieved');
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /emis/user/:userId
     * Get all EMIs for a user (across all loans)
     */
    static async getEmisByUserId(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.params.userId as string;
            const emis = await emiService.getEmisByUserId(userId);

            return successResponse(res, emis, 'User EMIs retrieved');
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /emis/:id
     * Get a specific EMI detail
     */
    static async getEmi(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            const emi = await emiService.getEmi(id);

            if (!emi) {
                throw new NotFoundError();
            }

            return successResponse(res, emi, 'EMI details retrieved');
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /emis/generate
     * Manual trigger for testing
     */
    static async generateSchedule(req: Request, res: Response, next: NextFunction) {
        try {
            const { loanId, userId, amount, interestRate, tenureMonths } = req.body;

            if (!loanId || !userId || !amount || !tenureMonths) {
                throw new BadRequestError('Missing required fields');
            }

            const emis = await emiService.generateEmiSchedule(loanId, userId, amount, interestRate || 10, tenureMonths);

            return successResponse(res, emis, 'EMI schedule generated', 201);
        } catch (error) {
            next(error);
        }
    }
}
