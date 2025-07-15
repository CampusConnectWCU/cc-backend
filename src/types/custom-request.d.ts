import { Request } from "express";

// No session property needed anymore.

declare global {
  namespace Express {
    interface Request {}
  }
}

export {};
