export enum UserRole {
    USER = 'user',
    ADMIN = 'admin',
}

export interface UserDoc {
    id: string;
    email: string;
    password?: string;
    role: UserRole;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}
