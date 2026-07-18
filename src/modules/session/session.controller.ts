import { Request, Response, NextFunction } from "express";
import { SessionService } from "./session.service";

export class SessionController {

    private sessionService: SessionService;

    constructor(sessionService: SessionService) {
        this.sessionService = sessionService;
    }

    // create a session
    async createSession(req: Request, res: Response, next: NextFunction) {
        try {
            const session = req.body;
            const result = await this.sessionService.createSession(session);
            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    // get all authenticated use sessions
    async getSessions(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id as string; // authenticated user id
            const { page, limit } = req.query;
            const result = await this.sessionService.getAllSessions(userId, page, limit);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    // get a session by id
    async getSessionById(req: Request, res: Response, next: NextFunction) {
        try {
            const sessionId = req.params.id;
            const result = await this.sessionService.getSessionById(sessionId);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    // update a session
    async updateSession(req: Request, res: Response, next: NextFunction) {
        try {
            const sessionId = req.params.id;
            const userId = req.user?.id as string; // authenticated user id
            const session = { ...req.body, id: sessionId };
            const result = await this.sessionService.updateSession(session, userId);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    // cancel a session
    async cancelSession(req: Request, res: Response, next: NextFunction) {
        try {
            const sessionId = req.params.id;
            const userId = req.user?.id as string; // authenticated user id
            const result = await this.sessionService.cancelSession(sessionId, userId);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    // complete a session
    async completeSession(req: Request, res: Response, next: NextFunction) {
        try {
            const sessionId = req.params.id;
            const userId = req.user?.id as string; // authenticated user id
            const result = await this.sessionService.completeSession(sessionId, userId);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

}