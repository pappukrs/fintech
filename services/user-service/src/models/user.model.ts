export interface Address {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
}

export interface BankDetails {
    account_number: string;
    ifsc_code: string;
    bank_name: string;
    account_holder_name: string;
}

export interface UserProfileDoc {
    id: string; // references auth_schema.users(id)
    email: string;
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    date_of_birth?: Date;
    gender?: string;
    address?: Address; // Stored as JSONB
    bank_details?: BankDetails; // Stored as JSONB
    pan_number?: string;
    aadhaar_number?: string;
    kyc_verified: boolean;
    created_at: Date;
    updated_at: Date;
}
