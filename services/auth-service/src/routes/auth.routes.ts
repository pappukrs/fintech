import express from 'express';
import { AuthController } from '../controllers/auth.controller';
import { body } from 'express-validator';
import { validateRequest } from '@platform/common';

const router = express.Router();
const authController = new AuthController();

router.post(
    '/signup',
    [
        body('email').isEmail().withMessage('Email must be valid'),
        body('password')
            .trim()
            .isLength({ min: 4, max: 20 })
            .withMessage('Password must be between 4 and 20 characters'),
    ],
    validateRequest,
    (req: express.Request, res: express.Response) => authController.signup(req, res)
);

router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Email must be valid'),
        body('password').trim().notEmpty().withMessage('You must supply a password'),
    ],
    validateRequest,
    (req: express.Request, res: express.Response) => authController.login(req, res)
);

router.post('/logout', (req: express.Request, res: express.Response) => authController.logout(req, res));
router.get('/currentuser', (req: express.Request, res: express.Response) => authController.currentUser(req, res));

export { router as authRouter };
