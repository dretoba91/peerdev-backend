import pool from "../../config/db";
import { SessionRequest } from "./session-request.types";

export const sessionRequestRepository = {
  // create a new session request
  async create(sessionRequest: SessionRequest): Promise<void> {
    const { requester_id, recipient_id, skill_id, message, status } =
      sessionRequest;
    await pool.execute(
      `INSERT INTO session_requests (recipient_id, requester_id, skill_id, message, status) VALUES (?, ?, ?, ?, ?, ?)`,
      [recipient_id, requester_id, skill_id, message, status],
    );
  },

  // get session requests by both requester_id and recipient_id with status filter "pending"
  async sessionRequestExists(
    requester_id: string,
    recipient_id: string,
  ): Promise<boolean> {
    const [rows] = await pool.execute(
      `SELECT * FROM session_requests WHERE requester_id = ? AND recipient_id = ? AND status = 'pending'`,
      [requester_id, recipient_id],
    );
    return (rows as SessionRequest[]).length > 0;
  },

  // get session requests by recipient_id with optional status filter and pagination
  async getByRecipientId(
    recipient_id: string,
    limit: number,
    offset: number,
    status?: string,
  ): Promise<{ data: SessionRequest[]; total: number }> {
    // 1. Build the shared WHERE clause conditions and base parameters
    let whereClause = `WHERE recipient_id = ?`;
    const baseParams: Array<string | number> = [recipient_id];

    if (status) {
      whereClause += ` AND status = ?`;
      baseParams.push(status);
    }

    // 2. Compose the clean final queries using the shared WHERE clause
    const dataQuery = `SELECT * FROM session_requests ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    const countQuery = `SELECT COUNT(*) as total FROM session_requests ${whereClause}`;

    // 3. Execute concurrently. Pass a shallow copy of baseParams to the data query + pagination parameters
    const [[rows], [countRows]] = await Promise.all([
      pool.execute(dataQuery, [...baseParams, limit, offset]),
      pool.execute(countQuery, baseParams),
    ]);

    // 4. Safely extract total count
    const total = (countRows as any)[0]?.total || 0;
    return { data: rows as SessionRequest[], total };
  },

  // get session requests by requester_id with optional status filter and pagination
  async getByRequesterId(
    requester_id: string,
    limit: number,
    offset: number,
    status?: string
  ): Promise<{ data: SessionRequest[]; total: number }> {
    // 1. Build the shared WHERE clause conditions and base parameters
    let whereClause = `WHERE requester_id = ?`;
    const baseParams: Array<string | number> = [requester_id];

    if (status) {
      whereClause += ` AND status = ?`;
      baseParams.push(status);
    }

    // 2. Compose the clean final queries using the shared WHERE clause
    const dataQuery = `SELECT * FROM session_requests ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    const countQuery = `SELECT COUNT(*) as total FROM session_requests ${whereClause}`;

    // 3. Execute concurrently. Pass a shallow copy of baseParams to the data query + pagination parameters
    const [[rows], [countRows]] = await Promise.all([
      pool.execute(dataQuery, [...baseParams, limit, offset]),
      pool.execute(countQuery, baseParams),
    ]);

    // 4. Safely extract total count
    const total = (countRows as any)[0]?.total || 0;
    return { data: rows as SessionRequest[], total };
  },

  // get session request by id
  async getById(id: string): Promise<SessionRequest | null> {
    const [rows] = await pool.execute(
      `SELECT * FROM session_requests WHERE id = ?`,
      [id],
    );
    return (rows as SessionRequest[])[0] || null;
  },

  // update session request status = accepted or rejected

  async updateStatus(
    requestId: string,
    status: "accepted" | "rejected",
  ): Promise<void> {
    await pool.execute(`UPDATE session_requests SET status = ? WHERE id = ?`, [
      status,
      requestId,
    ]);
  },

  // update session request status when requester cancels the request
  async cancelRequest(requestId: string): Promise<void> {
    await pool.execute(`DELETE FROM session_requests WHERE id = ?`, [
      requestId,
    ]);
  },
};
