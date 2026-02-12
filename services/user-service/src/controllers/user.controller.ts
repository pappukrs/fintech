import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { successResponse, BadRequestError, NotFoundError } from '@platform/common';

const userService = new UserService();

export class UserController {
    /**
     * POST /users
     * Create a new user profile
     */
    static async createProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const { id, email, first_name, last_name, phone_number, date_of_birth, gender } = req.body;

            if (!id || !email) {
                throw new BadRequestError('User ID and email are required');
            }

            const profile = await userService.createProfile({
                id,
                email,
                first_name,
                last_name,
                phone_number,
                date_of_birth,
                gender,
            });

            return successResponse(res, profile, 'User profile created', 201);
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /users/:id
     * Get user profile by ID
     */
    static async getProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            const profile = await userService.getProfile(id);

            if (!profile) {
                throw new NotFoundError();
            }

            return successResponse(res, profile, 'User profile retrieved');
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /users/:id
     * Update user profile
     */
    static async updateProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            const updates = req.body;

            const profile = await userService.updateProfile(id, updates);

            if (!profile) {
                throw new NotFoundError();
            }

            return successResponse(res, profile, 'User profile updated');
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /users/:id/kyc
     * Update KYC data (PAN, Aadhaar)
     */
    static async updateKyc(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            const { pan_number, aadhaar_number } = req.body;

            const updates: Record<string, any> = {};
            if (pan_number) updates.pan_number = pan_number;
            if (aadhaar_number) updates.aadhaar_number = aadhaar_number;

            const profile = await userService.updateProfile(id, updates);

            if (!profile) {
                throw new NotFoundError();
            }

            return successResponse(res, profile, 'KYC data updated');
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /users/:id/address
     * Update user address
     */
    static async updateAddress(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            const address = req.body;

            const profile = await userService.updateProfile(id, { address });

            if (!profile) {
                throw new NotFoundError();
            }

            return successResponse(res, profile, 'Address updated');
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /users/:id/bank-details
     * Update bank details
     */
    static async updateBankDetails(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            const bank_details = req.body;

            const profile = await userService.updateProfile(id, { bank_details });

            if (!profile) {
                throw new NotFoundError();
            }

            return successResponse(res, profile, 'Bank details updated');
        } catch (error) {
            next(error);
        }
    }
}
