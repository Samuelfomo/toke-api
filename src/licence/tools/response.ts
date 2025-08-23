import { Response } from 'express';

import HttpStatus from './http-status';

export default class R {
    /**
     * Handle successful JSON response
     */
    static handleSuccess(
        res: Response,
        structure: object,
        httpCode: number = HttpStatus.SUCCESS
    ): void {
        res.status(httpCode).json({
            success: true,
            data: structure,
        });
    }

    static handleCreated(res: Response, structure: object): void {
        this.handleSuccess(res, structure, HttpStatus.CREATED);
    }

    /**
     * Handle error JSON response
     */
    static handleError(res: Response, httpCode: number, error: object): void {
        res.status(httpCode).json({
            success: false,
            error: error,
            timestamp: new Date().toISOString(),
        });
    }

    static handleNoContent(res: Response): void {
        res.status(HttpStatus.NO_CONTENT).end();
    }
}
