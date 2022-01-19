import { Request, Response } from 'express';
import { OkexService } from '../services/okexService';
import { EstimationRepository } from '../repository/estimationRepository';
import { OrderRepository } from '../repository/orderRepository';
import { Parser } from '../util/parser';

enum Status {
    EXPIRE = 'EXPIRE',
    AWAITING = 'AWAITING',
    SUCCESS = 'SUCCESS',
}

export class BeloController {
    private okexService = new OkexService();
    private estimationRepository = new EstimationRepository();
    private orderRepository = new OrderRepository();

    async estimate(request: Request, response: Response) {
        const responseEstimationOkex = await this.okexService.getEstimations(
            request.body.pair,
            request.body.volume
        );
        const priceEstimation = Parser.priceEstimation(responseEstimationOkex);
        const fee = await this.getFee(request.body.volume, request.body.pair);
        const to = (request.body.volume - fee) / priceEstimation;
        const secondCustom = Number(process.env.SECOND_CUSTOM);
        const expiration: Date = new Date();
        expiration.setSeconds(expiration.getSeconds() + secondCustom);

        const estimationObject = {
            pair: request.body.pair,
            from: request.body.volume,
            to: to,
            transactionFee: fee,
            timestampLimit: expiration,
            status: Status.AWAITING,
        };

        response
            .status(201)
            .send(await this.estimationRepository.save(estimationObject));
    }

    async swap(request: Request, response: Response) {
        const estimation = await this.estimationRepository.findOne(
            request.params.id
        );
        if (!estimation) throw new Error('estimation not found');
        if (Status.SUCCESS == estimation.status)
            throw new Error('estimation already executed');
        if (Status.EXPIRE == estimation.status)
            throw new Error('estimation expired');
        if (estimation.timestampLimit < new Date()) {
            estimation.status = Status.EXPIRE;
            await this.estimationRepository.save(estimation);
            throw new Error('estimation expired');
        }
        const fee = await this.getFee(estimation.from, estimation.pair);
        const responseSwapOkex = await this.okexService.postSwap(
            estimation,
            fee
        );
        if (responseSwapOkex.code != '0') {
            throw Error(responseSwapOkex.data[0].sMsg);
        }
        const orderId = Parser.orderId(responseSwapOkex);

        const orderObject = {
            pair: estimation.pair,
            from: estimation.from,
            to: null,
            transactionFee: fee,
            timestamp: new Date(),
            status: Status.AWAITING,
            orderIdOkex: orderId,
            estimationId: estimation.idEstimation,
        };

        estimation.status = Status.SUCCESS;
        await this.estimationRepository.update(estimation);

        response.status(200).send(await this.orderRepository.save(orderObject));
    }

    private async getFee(volume: number, pair: string) {
        const responseFeeOkex = await this.okexService.getFee(pair);
        const percentageFeeOkex = Parser.feeOkex(responseFeeOkex);
        const percentageFeeBelo = Number(process.env.FEE_BELO);

        const beloFee = (volume * percentageFeeBelo) / 100;
        const okexFee = (volume * percentageFeeOkex) / 100;
        return beloFee + okexFee;
    }

    async getAllEstimation(request: Request, response: Response) {
        response.json(await this.estimationRepository.all());
    }

    async getEstimationById(request: Request, response: Response) {
        const estimation = await this.estimationRepository.findOne(
            request.params.id
        );
        if (!estimation) throw new Error('estimation not found');
        response.json(estimation);
    }

    async getAllOrder(request: Request, response: Response) {
        response.json(await this.orderRepository.all());
    }

    async getOrderById(request: Request, response: Response) {
        const order = await this.orderRepository.findOne(request.params.id);
        if (!order) throw new Error('order not found');
        if (order.to == null || Number.isNaN(order.to)) {
            const responseOrder =
                await this.okexService.getEstimationByOrderIDOkex(
                    order.orderIdOkex
                );

            order.to = Parser.priceOrder(responseOrder);
            order.status = Status.SUCCESS;
            await this.orderRepository.update(order);
        }
        response.json(order);
    }
}
