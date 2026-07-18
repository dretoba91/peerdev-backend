import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../../shared/utils/errors";
import { logger } from "../../shared/utils/loggers";
import {
  buildPagination,
  PaginatedResponse,
} from "../../shared/utils/pagination";
import { MessageResponse } from "../../shared/utils/response";
import { sessionRequestRepository } from "./session-request.repository";
import { SessionRequest } from "./session-request.types";

export class SessionRequestService {
  // create a session request
  async createSessionRequest(
    request: SessionRequest,
  ): Promise<MessageResponse> {
    try {
      const existingRequest =
        await sessionRequestRepository.sessionRequestExists(
          request.requester_id,
          request.recipient_id,
        );

      if (existingRequest) {
        throw new ConflictError(
          "A pending session request already exists between these users.",
        );
      }
      await sessionRequestRepository.create(request);
      return { message: "Session request sent!!!" };
    } catch (error) {
      logger.error("Create follow error:", error);
      throw error;
    }
  }

  // get session requests by recipient_id with optional status filter
  async getRecipientSessionRequests(
    recipient_id: string,
    page: any,
    limit: any,
    status?: string,
  ): Promise<PaginatedResponse<SessionRequest>> {
    try {
      const parsedPage = Math.max(1, parseInt(page) || 1);
      const parsedLimit = Math.max(1, Math.min(100, parseInt(limit) || 10));
      const offset = (parsedPage - 1) * parsedLimit;
      const { data, total } = await sessionRequestRepository.getByRecipientId(
        recipient_id,
        parsedLimit,
        offset,
        status,
      );

      const pagination = buildPagination(total, parsedPage, parsedLimit);
      return { data, pagination };
    } catch (error) {
      logger.error("Get session request error:", error);
      throw error;
    }
  }

  // get session requests by requester_id with optional status filter
  async getRequesterSessionRequests(
    requester_id: string,
    page: any,
    limit: any,
    status?: string,
  ): Promise<PaginatedResponse<SessionRequest>> {
    try {
      const parsedPage = Math.max(1, parseInt(page) || 1);
      const parsedLimit = Math.max(1, Math.min(100, parseInt(limit) || 10));
      const offset = (parsedPage - 1) * parsedLimit;
      const { data, total } = await sessionRequestRepository.getByRequesterId(
        requester_id,
        parsedLimit,
        offset,
        status,
      );

      const pagination = buildPagination(total, parsedPage, parsedLimit);
      return { data, pagination };
    } catch (error) {
      logger.error("Get session request error:", error);
      throw error;
    }
  }

  // update request status with accepted or rejected.
  async updateRequestStatus(
    requestId: string, status: 'accepted' | 'rejected',
    user_id: string,
  ): Promise<MessageResponse> {
    try {
      const existingRequest = await sessionRequestRepository.getById(
        requestId,
      );
      if (!existingRequest)
        throw new NotFoundError("Session request not found");
      if (existingRequest.status !== "pending")
        throw new BadRequestError("Request is no longer pending");

        if (user_id !== existingRequest.recipient_id) {
        throw new ConflictError(
          "Only the recipient can update the session request status.",
        );
      }

      await sessionRequestRepository.updateStatus(requestId, status);

      return { message: `Session request ${status} successfully.` };
    } catch (error) {
      logger.error("Update session request status error:", error);
      throw error;
    }
  }

  // cancel a session request
  async cancelSessionRequest(
    requestId: string,
    user_id: string,
  ): Promise<MessageResponse> {
    try {
       const existingRequest = await sessionRequestRepository.getById(
        requestId,
      );
      if (!existingRequest)
        throw new NotFoundError("Session request not found");
      if (existingRequest.status !== "pending")
        throw new BadRequestError("Request is no longer pending");

      if (user_id !== existingRequest.requester_id) {
        throw new ConflictError(
          "Only the requester can cancel the session request.",
        );
      }

      // update the session request status to cancelled
      await sessionRequestRepository.cancelRequest(requestId);
      return { message: "Session request cancelled successfully." };
    } catch (error) {
      logger.error("Cancel session request error:", error);
      throw error;
    }
  }
}
