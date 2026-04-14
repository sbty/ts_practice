import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

/**
 * Higher-order function that returns an Express middleware for Zod validation.
 */
export const validate = (schema: AnyZodObject) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({
                    error: "Validation failed",
                    details: error.errors.map(e => e.message)
                });
            } else {
                res.status(500).json({ error: "Internal Server Error" });
            }
        }
    };
};
