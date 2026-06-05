import { Request } from 'express';

export type ClientTypes = "mobile" | "web";

export const getClientType = (req: Request): ClientTypes => {
    const clientHeader = req.headers["x-client-type"] as string;
    if (clientHeader === "mobile") {
        return "mobile";
    }
    return "web"; // default to web if header is missing or unrecognized

}