import { Request, Response } from 'express';
import { AdminService } from '../services/admin.service';
import { loanGrpcClient } from '../grpc/loan.client';
import { AdminModel } from '../models/admin.model';

export const getDashboard = async (req: Request, res: Response) => {
    try {
        const stats = await AdminService.getDashboardStats();
        res.json({ status: 'success', data: stats });
    } catch (err: any) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

export const approveLoan = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        // Mock admin ID from auth middleware (to be implemented)
        const adminId = 'admin-123';

        const response = await loanGrpcClient.approveLoan(id as string, adminId, reason);

        // Audit log
        await AdminModel.createAuditLog({
            admin_id: adminId,
            action: 'APPROVE_LOAN',
            details: { loanId: id, reason }
        });

        res.json(response);
    } catch (err: any) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

export const rejectLoan = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const adminId = 'admin-123';

        const response = await loanGrpcClient.rejectLoan(id as string, adminId, reason);

        // Audit log
        await AdminModel.createAuditLog({
            admin_id: adminId,
            action: 'REJECT_LOAN',
            details: { loanId: id, reason }
        });

        res.json(response);
    } catch (err: any) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};
