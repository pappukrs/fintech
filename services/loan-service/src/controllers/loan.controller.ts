import { Request, Response, NextFunction } from 'express';
import { LoanService } from '../services/loan.service';
import { successResponse, BadRequestError, NotFoundError } from '@platform/common';

const loanService = new LoanService();

export class LoanController {
    /**
     * POST /loans
     * Apply for a loan
     */
    static async applyLoan(req: Request, res: Response, next: NextFunction) {
        try {
            const { user_id, amount, tenure_months, interest_rate } = req.body;

            // In a real app, user_id would come from the JWT token (req.currentUser.id)
            if (!user_id) {
                throw new BadRequestError('User ID is required');
            }

            const loan = await loanService.applyLoan(user_id, amount, tenure_months, interest_rate);

            return successResponse(res, loan, 'Loan applied successfully', 201);
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /loans/:id
     * Get loan details
     */
    static async getLoan(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            const loan = await loanService.getLoan(id);

            if (!loan) {
                throw new NotFoundError();
            }

            return successResponse(res, loan, 'Loan details retrieved');
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /loans/user/:userId
     * Get all loans for a user
     */
    static async getLoansByUser(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.params.userId as string;
            const loans = await loanService.getLoansByUser(userId);

            return successResponse(res, loans, 'User loans retrieved');
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /loans/:id/approve
     * Approve a loan (Admin only)
     */
    static async approveLoan(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            const loan = await loanService.approveLoan(id);

            return successResponse(res, loan, 'Loan approved successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /loans/:id/reject
     * Reject a loan (Admin only)
     */
    static async rejectLoan(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            const { reason } = req.body;

            if (!reason) {
                throw new BadRequestError('Rejection reason is required');
            }

            const loan = await loanService.rejectLoan(id, reason);

            return successResponse(res, loan, 'Loan rejected successfully');
        } catch (error) {
            next(error);
        }
    }
}
