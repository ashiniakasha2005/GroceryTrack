import { UserPayload } from "../src/middleware/authMiddleware";

declare global {
    namespace Express {
        interface Request {
            user?: UserPayload;
        }
    }
}

export {};
