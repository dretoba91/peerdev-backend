
export interface SessionRequest {
    id?: string;
    requester_id: string;
    recipient_id: string;
    skill_id: string;
    message?: string;
    status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
    created_at?: Date;
}