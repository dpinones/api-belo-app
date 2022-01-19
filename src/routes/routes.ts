import { body, param } from 'express-validator';
import { BeloController } from '../controllers/beloController';
import { HealthController } from '../controllers/healthController';

export const Routes = [
    {
        method: 'get',
        route: '/belo/api/v1/microservices/health/ping',
        controller: HealthController,
        action: 'ping',
        validation: [],
    },
    {
        method: 'get',
        route: '/belo/api/v1/microservices/estimations',
        controller: BeloController,
        action: 'getAllEstimation',
        validation: [],
    },
    {
        method: 'get',
        route: '/belo/api/v1/microservices/estimations/:id',
        controller: BeloController,
        action: 'getEstimationById',
        validation: [
            param('id')
                .exists()
                .withMessage('volume is requiered')
                .isInt()
                .withMessage('volume must be a int'),
        ],
    },
    {
        method: 'post',
        route: '/belo/api/v1/microservices/estimations',
        controller: BeloController,
        action: 'estimate',
        validation: [
            body('pair')
                .exists()
                .withMessage('pair is requiered')
                .isString()
                .withMessage('pair must be a string')
                .isIn([
                    'USDT-ETH',
                    'ETH-USDT',
                    'USDT-BTC',
                    'BTC-USDT',
                    'USDC-AAVE',
                    'AAVE-USDC',
                ])
                .withMessage('pair does contain invalid value'),
            body('volume')
                .exists()
                .withMessage('volume is requiered')
                .isInt({ min: 0 })
                .withMessage('volume must be greater than zero'),
        ],
    },
    {
        method: 'post',
        route: '/belo/api/v1/microservices/estimations/swap/:id',
        controller: BeloController,
        action: 'swap',
        validation: [
            param('id')
                .exists()
                .withMessage('volume is requiered')
                .isInt()
                .withMessage('volume must be a int'),
        ],
    },
    {
        method: 'get',
        route: '/belo/api/v1/microservices/orders',
        controller: BeloController,
        action: 'getAllOrder',
        validation: [],
    },
    {
        method: 'get',
        route: '/belo/api/v1/microservices/orders/:id',
        controller: BeloController,
        action: 'getOrderById',
        validation: [
            param('id')
                .exists()
                .withMessage('volume is requiered')
                .isInt()
                .withMessage('volume must be a int'),
        ],
    },
];
