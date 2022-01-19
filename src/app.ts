import * as express from 'express';
import * as bodyParser from 'body-parser';
import { NextFunction, Request, Response } from 'express';
import * as morgan from 'morgan';
import * as cors from 'cors';
import { Routes } from './routes/routes';
import { validationResult } from 'express-validator';
import swaggerUi = require('swagger-ui-express');
import { ConfigSwagger } from './swagger/configSwagger';

function handleError(err, _req, res, _next) {
    console.log('Error: ', err);
    res.status(err.statusCode || 500).send({ errors: [{ msg: err.message }] });
}

const app = express();
app.use(cors({ origin: '*' }));
app.use(morgan('tiny'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

Routes.forEach((route) => {
    (app as any)[route.method](
        route.route,
        ...route.validation,
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    console.log('Error: ', errors.array());
                    return res.status(400).json({ errors: errors.array() });
                }

                const result = await new (route.controller as any)()[
                    route.action
                ](req, res, next);
                res.json(result);
            } catch (err) {
                console.log('Error: ', err);
                next(err);
            }
        }
    );
});

app.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(ConfigSwagger.data(), null, null, null)
);

app.use('*', (req: Request, res: Response) => {
    res.status(500).send({ errors: [{ msg: 'Make sure url is correct!' }] });
});

app.use(handleError);

export default app;
