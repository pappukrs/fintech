import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    async signup(req: Request, res: Response) {
        const { email, password } = req.body;
        const token = await this.authService.signup(email, password);

        // Set cookie or return token
        req.session = { jwt: token };
        res.status(201).send({ token });
    }

    async login(req: Request, res: Response) {
        const { email, password } = req.body;
        const token = await this.authService.login(email, password);

        req.session = { jwt: token };
        res.status(200).send({ token });
    }

    async logout(req: Request, res: Response) {
        req.session = null;
        res.status(200).send({});
    }

    async currentUser(req: Request, res: Response) {
        res.send({ currentUser: (req as any).currentUser || null });
    }
}
