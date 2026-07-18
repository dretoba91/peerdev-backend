import { NextFunction, Request, Response } from "express";
import { SessionRequestService } from "./session-request.service";
import { SessionRequest } from "./session-request.types";
import { BadRequestError } from "../../shared/utils/errors";

export class SessionRequestController {
    private sessionRequestService: SessionRequestService;

    constructor(sessionRequestService: SessionRequestService) {
        this.sessionRequestService = sessionRequestService;
    }

    // create a session request
    async createSessionRequest(req: Request, res: Response, next: NextFunction) {
        // 1. who can create a session request? -> authenticated user (requester) can create a session request to another user (recipient)
        // 2. what data is needed to create a session request? -> requester_id, recipient_id, skill_id, status (default: pending, message (optional but can come with a default message) and their validation
        try {
            const requester_id = req.user?.id as string; // authenticated user id
            const { recipient_id, message, skill_id } = req.body;
            const request: SessionRequest = {
                requester_id,
                recipient_id,
                skill_id,
                status: "pending",
                message,
            };
            const result = await this.sessionRequestService.createSessionRequest(request);
            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    // get session requests by recipient_id or requester_id
    async getRequest(req: Request, res: Response, next: NextFunction) {
        try {
            const { page, limit, status, role } = req.query;
            const useId = req.user?.id as string; // authenticated user id

            const roleValue = role as string | undefined;
            if (!roleValue || (roleValue !== "recipient" && roleValue !== "requester")) {
                throw new BadRequestError("Invalid or missing role query parameter. Must be 'recipient' or 'requester'.");
            }

            let requests;
            if (roleValue === "recipient") {
                requests = await this.sessionRequestService.getRecipientSessionRequests(
                    useId,
                    page,
                    limit,
                    status as string | undefined,
                );
            } else {
                requests = await this.sessionRequestService.getRequesterSessionRequests(
                    useId,
                    page,
                    limit,
                    status as string | undefined,
                );
            }

            res.status(200).json(requests);
        } catch (error) {
            next(error);
        }
    }

    // update session request status for accepted
    async acceptRequest(req: Request, res: Response, next: NextFunction) {
        try {
            const requestId = req.params.id;
            const user_id = req.user?.id as string; // authenticated user id
            const result = await this.sessionRequestService.updateRequestStatus(requestId, "accepted", user_id);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    // update session request status for rejected
    async rejectRequest(req: Request, res: Response, next: NextFunction) {
        try {
            const requestId = req.params.id;
            const user_id = req.user?.id as string; // authenticated user id
            const result = await this.sessionRequestService.updateRequestStatus(requestId, "rejected", user_id);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }



    // cancel session request
    async cancelSessionRequest(req: Request, res: Response, next: NextFunction) {
        try {
            const requestId = req.params.id;
            const user_id = req.user?.id as string; // authenticated user id
            const result = await this.sessionRequestService.cancelSessionRequest(requestId, user_id);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}