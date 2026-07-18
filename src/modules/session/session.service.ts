import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../../shared/utils/errors";
import { logger } from "../../shared/utils/loggers";
import {
  buildPagination,
  PaginatedResponse,
} from "../../shared/utils/pagination";
import { MessageResponse } from "../../shared/utils/response";
import { sessionRequestRepository } from "../session-request/session-request.repository";
import { SessionRepository } from "./session.repository";
import { Session } from "./session.types";

export class SessionService {
  // Create a new session
  async createSession(session: Session): Promise<MessageResponse> {
    try {
      // check if the session request exists.
      const existingSessionRequest = await sessionRequestRepository.getById(
        session.request_id,
      );
      if (!existingSessionRequest) {
        throw new ConflictError("Session request does not exist.");
      }

      // check if a session already exists for this request.
      const existingSession = await SessionRepository.getSessionByRequestId(
        session.request_id,
      );
      if (existingSession) {
        throw new ConflictError("A session already exists for this request.");
      }

      await SessionRepository.create(session);
      return { message: "Session created successfully." };
    } catch (error) {
      logger.error("Create session error:", error);
      throw error;
    }
  }

  // Get all sessions for an authenticated user with pagination
  async getAllSessions(
    userId: string,
    page: any,
    limit: any,
  ): Promise<PaginatedResponse<Session>> {
    try {
      const parsedPage = Math.max(1, parseInt(page) || 1);
      const parsedLimit = Math.max(1, Math.min(100, parseInt(limit) || 10));
      const offset = (parsedPage - 1) * parsedLimit;

      const { session, total } = await SessionRepository.getAllSessions(
        userId,
        parsedLimit,
        offset,
      );
      const pagination = buildPagination(total, parsedPage, parsedLimit);
      return { data: session, pagination };
    } catch (error) {
      logger.error("Get all sessions error:", error);
      throw error;
    }
  }

  // Get a session by ID
  async getSessionById(sessionId: string): Promise<Session | null> {
    try {
      const session = await SessionRepository.getSession(sessionId);
      return session;
    } catch (error) {
      logger.error("Get session by ID error:", error);
      throw error;
    }
  }

  // Update a session (reschedule, add meeting link, etc.)
  async updateSession(
    session: Session,
    userId: string,
  ): Promise<MessageResponse> {
    try {
      // check if the session exists.
      const existingSession = await SessionRepository.getSession(session.id!);
      if (!existingSession) {
        throw new NotFoundError("Session does not exist.");
      }

      if (
        userId !== existingSession.requester_id &&
        userId !== existingSession.recipient_id
      ) {
        throw new ForbiddenError("You are not part of this session.");
      }

      await SessionRepository.update(session);
      return { message: "Session updated successfully." };
    } catch (error) {
      logger.error("Update session error:", error);
      throw error;
    }
  }

  // Cancel a session
  async cancelSession(
    sessionId: string,
    userId: string,
  ): Promise<MessageResponse> {
    try {
      // check if the session exists.
      const existingSession = await SessionRepository.getSession(sessionId);
      if (!existingSession) {
        throw new ConflictError("Session does not exist.");
      }

      if (
        userId !== existingSession.requester_id &&
        userId !== existingSession.recipient_id
      ) {
        throw new ForbiddenError("You are not part of this session.");
      }
      if (existingSession.status !== "scheduled") {
        throw new BadRequestError("Only scheduled sessions can be cancelled.");
      }

      await SessionRepository.cancel(sessionId);
      return { message: "Session cancelled successfully." };
    } catch (error) {
      logger.error("Cancel session error:", error);
      throw error;
    }
  }

  // Mark a session as completed
  async completeSession(
    sessionId: string,
    userId: string,
  ): Promise<MessageResponse> {
    try {
      // check if the session exists.
      const existingSession = await SessionRepository.getSession(sessionId);
      if (!existingSession) {
        throw new NotFoundError("Session does not exist.");
      }

      if (existingSession.status !== "scheduled") {
        throw new BadRequestError(
          "Only scheduled sessions can be marked as completed.",
        );
      }

      if (
        userId !== existingSession.requester_id &&
        userId !== existingSession.recipient_id
      ) {
        throw new ForbiddenError("You are not part of this session.");
      }

      await SessionRepository.complete(sessionId);
      return { message: "Session marked as completed successfully." };
    } catch (error) {
      logger.error("Complete session error:", error);
      throw error;
    }
  }
}
