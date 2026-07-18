
export interface Session {
    id?: string;
    request_id: string;
    scheduled_at: Date;
    duration_minutes: number;
    status: 'scheduled' | 'completed' | 'cancelled' | 'expired';
    meeting_link?: string;
    created_at?: Date;
}

export type SessionWithParticipants = Session & {
  requester_id: string;
  recipient_id: string;
}