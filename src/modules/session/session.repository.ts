import pool from "../../config/db";
import { Session, SessionWithParticipants } from "./session.types";


export const SessionRepository = {
    // Implement the methods for interacting with the database for session-related operations
    // create a new session
    async create(session: Session): Promise<void> {
        const { request_id, scheduled_at, duration_minutes, status, meeting_link } = session;
        await pool.execute(
            `INSERT INTO sessions (request_id, scheduled_at, duration_minutes, status, meeting_link) VALUES (?, ?, ?, ?, ?)`,
            [request_id, scheduled_at, duration_minutes, status, meeting_link],
        );
    },


    //get all authenticated user sessions
    async getAllSessions(userId: string, limit: any, offset: any): Promise<{ session: Session[]; total: number }> {
        const [sessionData, countData] =  await Promise.all([

            pool.execute(
            `SELECT s.* FROM sessions AS s
             JOIN session_requests as sr ON s.request_id = sr.id
             WHERE sr.requester_id = ? OR sr.recipient_id = ?
             ORDER BY s.created_at DESC
             LIMIT ? OFFSET ?`,
            [userId, userId, limit, offset],
            ),

            pool.execute(
                `SELECT COUNT(*) as total FROM sessions AS s
                JOIN session_requests as sr ON s.request_id = sr.id
                WHERE sr.requester_id = ? OR sr.recipient_id = ?`,
                [userId, userId]
            )

        ])
        const rows = (sessionData as [Session[], any])[0];
        const countRows = (countData as [{ total: number }[], any])[0];
        const total = countRows[0]?.total ?? 0;
        return { session: rows, total: total };
        
    },

    // get a session by request_id
    async getSessionByRequestId(request_id: string): Promise<Session | null> {
        const [rows] = await pool.execute(
            `SELECT s.* FROM sessions AS s
             WHERE s.request_id = ?`,
             [request_id],
        )
        return (rows as Session[])[0] || null
    },

    // get a session by id
    async getSession(id: string): Promise<SessionWithParticipants | null> {
        const [rows] = await pool.execute(
            `SELECT s.*, sr.requester_id, sr.recipient_id
             FROM sessions AS s
             JOIN session_requests sr ON s.request_id = sr.id
             WHERE s.id = ?`,
             [id],
        )
        return (rows as SessionWithParticipants[])[0] || null
    },

    // update session (reschedule, add meeting link, etc.)
    async update(session: Session): Promise<void> {
        const { id, scheduled_at, duration_minutes, status, meeting_link } = session;
        await pool.execute(
            `UPDATE sessions SET scheduled_at = ?, duration_minutes = ?, status = ?, meeting_link = ? WHERE id = ?`,
            [scheduled_at, duration_minutes, status, meeting_link, id],
        );
    },

    // cancel a session. update the status to 'cancelled'
    async cancel(sessionId: string): Promise<void> {
        await pool.execute(
            `UPDATE sessions SET status = 'cancelled' WHERE id = ?`,
            [sessionId],
        );
    },

    // mark a session as completed. update the status to 'completed'
    async complete(sessionId: string): Promise<void> {
        await pool.execute(
            `UPDATE sessions SET status = 'completed' WHERE id = ?`,
            [sessionId],
        );
    }
}