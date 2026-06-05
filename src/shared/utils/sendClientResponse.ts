import { AuthUserResponse, RefreshTokenResponse } from "../../modules/auth/auth.types";
import { getClientType } from "./clientDetector";
import { Request, Response } from "express";


export const sendAuthResponse = (req: Request,
  res: Response,result: AuthUserResponse) => {
    const { user, access_token, refresh_token, session_id } = result;
    const clientType = getClientType(req);
    if (clientType === "mobile") {
        return res.status(200).json(result);
    }
    // For web clients, set refresh token in HttpOnly cookie
    res.cookie("refresh_token", refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return res.status(200).json({
        user,
        access_token,
        session_id
    });
}

export const sendRefreshTokenResponse = (req: Request, res: Response, result: RefreshTokenResponse) => {
    const { access_token, refresh_token, session_id } = result;
    const clientType = getClientType(req);
    if (clientType === "mobile") {
        return res.status(200).json(result);
    }
    // For web clients, set refresh token in HttpOnly cookie
    res.cookie("refresh_token", refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return res.status(200).json({
        access_token,
        session_id
    });
}
    