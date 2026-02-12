import { UserRepository } from '../repositories/user.repository';
import { UserProfileDoc } from '../models/user.model';
import { db } from '@platform/common';

export class UserService {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    async init() {
        await this.userRepository.createTable();
    }

    async createProfile(data: Partial<UserProfileDoc>): Promise<UserProfileDoc> {
        // Here we might want to check if the user exists in Auth service via gRPC
        // But for now, we assume the Auth service calls this or the user calls this after signup
        // data.id MUST be provided (from Auth token/service)
        if (!data.id) {
            throw new Error('User ID is required');
        }
        if (!data.email) {
            throw new Error('Email is required');
        }

        const existingUser = await this.userRepository.findById(data.id);
        if (existingUser) {
            throw new Error('User profile already exists');
        }

        return this.userRepository.create(data);
    }

    async getProfile(id: string): Promise<UserProfileDoc | null> {
        return this.userRepository.findById(id);
    }

    async updateProfile(id: string, updates: Partial<UserProfileDoc>): Promise<UserProfileDoc | null> {
        // Prevent updating immutable fields if any
        delete updates.id;
        delete updates.created_at;

        return this.userRepository.update(id, updates);
    }
}
