import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository';
import { PasswordService } from './password.service';
import { UserRole } from '../models/user';

export class AuthService {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    async signup(email: string, password: string, role: UserRole = UserRole.USER) {
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            throw new Error('Email in use');
        }

        const hashedPassword = await PasswordService.toHash(password);
        const user = await this.userRepository.create({
            email,
            password: hashedPassword,
            role,
        });

        return this.generateToken(user.id, user.email, user.role);
    }

    async login(email: string, password: string) {
        const existingUser = await this.userRepository.findByEmail(email);
        if (!existingUser) {
            throw new Error('Invalid credentials');
        }

        const passwordsMatch = await PasswordService.compare(
            existingUser.password!,
            password
        );

        if (!passwordsMatch) {
            throw new Error('Invalid credentials');
        }

        return this.generateToken(existingUser.id, existingUser.email, existingUser.role);
    }

    private generateToken(id: string, email: string, role: UserRole) {
        return jwt.sign(
            { id, email, role },
            process.env.JWT_KEY || 'secret',
            { expiresIn: '1h' }
        );
    }
}
