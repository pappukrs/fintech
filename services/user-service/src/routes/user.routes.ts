import { Router } from 'express';
import { body } from 'express-validator';
import { UserController } from '../controllers/user.controller';
import { validateRequest } from '@platform/common';

const router = Router();

// POST /users — Create user profile
router.post(
    '/',
    [
        body('id').isUUID().withMessage('Valid user ID is required'),
        body('email').isEmail().withMessage('Valid email is required'),
        body('first_name').optional().isString(),
        body('last_name').optional().isString(),
        body('phone_number').optional().isMobilePhone('any'),
    ],
    validateRequest,
    UserController.createProfile
);

// GET /users/:id — Get user profile
router.get('/:id', UserController.getProfile);

// PATCH /users/:id — Update user profile
router.patch(
    '/:id',
    [
        body('first_name').optional().isString(),
        body('last_name').optional().isString(),
        body('phone_number').optional().isMobilePhone('any'),
        body('date_of_birth').optional().isISO8601(),
        body('gender').optional().isIn(['male', 'female', 'other']),
    ],
    validateRequest,
    UserController.updateProfile
);

// PATCH /users/:id/kyc — Update KYC details
router.patch(
    '/:id/kyc',
    [
        body('pan_number').optional().isString().isLength({ min: 10, max: 10 }),
        body('aadhaar_number').optional().isString().isLength({ min: 12, max: 12 }),
    ],
    validateRequest,
    UserController.updateKyc
);

// PATCH /users/:id/address — Update address
router.patch(
    '/:id/address',
    [
        body('street').isString().withMessage('Street is required'),
        body('city').isString().withMessage('City is required'),
        body('state').isString().withMessage('State is required'),
        body('postal_code').isString().withMessage('Postal code is required'),
        body('country').isString().withMessage('Country is required'),
    ],
    validateRequest,
    UserController.updateAddress
);

// PATCH /users/:id/bank-details — Update bank details
router.patch(
    '/:id/bank-details',
    [
        body('account_number').isString().withMessage('Account number is required'),
        body('ifsc_code').isString().withMessage('IFSC code is required'),
        body('bank_name').isString().withMessage('Bank name is required'),
        body('account_holder_name').isString().withMessage('Account holder name is required'),
    ],
    validateRequest,
    UserController.updateBankDetails
);

export default router;
