import { Request, Response } from 'express';

export class HealthController {
    async ping(request: Request, response: Response) {
        response.status(200).send('Pong');
    }
}
