import { createConnection } from 'typeorm';
import * as request from 'supertest';
import app from '../../src/app';
import { port } from '../../src/config/config';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

let connection, server;

const mock = new MockAdapter(axios);

mock.onGet('https://www.okex.com/api/v5/trade/fills').reply(200, {
    code: '0',
    data: [
        {
            side: 'buy',
            fillSz: '0.00186415',
            fillPx: '42432.2',
            fee: '-0.00000186415',
            ordId: '403805279699214336',
            instType: 'SPOT',
            instId: 'BTC-USDT',
            clOrdId: '',
            posSide: 'net',
            billId: '403805279732768769',
            tag: '',
            execType: 'T',
            tradeId: '204588816',
            feeCcy: 'BTC',
            ts: '1642546681027',
        },
    ],
    msg: '',
});
mock.onGet(
    'https://www.okex.com/api/v5/market/books?instId=BTC-USDT&?sz=50'
).reply(200, {
    code: '0',
    msg: '',
    data: [
        {
            asks: [['42515.8', '0.426', '0', '1']],
            bids: [['42515.7', '0.71', '0', '1']],
            ts: '1642547039034',
        },
    ],
});
mock.onGet(
    'https://www.okex.com/api/v5/account/trade-fee?instType=SWAP&uly=BTC-USDT'
).reply(200, {
    code: '0',
    data: [
        {
            category: '1',
            delivery: '',
            exercise: '',
            instType: 'SWAP',
            level: 'Lv1',
            maker: '-0.0002',
            taker: '-0.0005',
            ts: '1642546655290',
        },
    ],
    msg: '',
});
mock.onPost('https://www.okex.com/api/v5/trade/order').reply(200, {
    code: '0',
    data: [
        {
            clOrdId: '',
            ordId: '403815115547615232',
            sCode: '0',
            sMsg: '',
            tag: '',
        },
    ],
    msg: '',
});

const testEstimation = {
    pair: 'BTC-USDT',
    volume: 50,
};

beforeEach(async () => {
    connection = await createConnection();
    await connection.synchronize(true);
    server = app.listen(port);
});

afterEach(() => {
    connection.close();
    server.close();
});

describe('GET estimations/:id', () => {
    it('get estimation', async () => {
        const responseEstimation = await request(app)
            .post('/belo/api/v1/microservices/estimations')
            .send(testEstimation);
        expect(responseEstimation.statusCode).toBe(201);
        expect(responseEstimation.body.idEstimation).toEqual(1);
        expect(responseEstimation.body.pair).toEqual(testEstimation.pair);
        expect(responseEstimation.body.from).toEqual(testEstimation.volume);

        const response = await request(app).get(
            '/belo/api/v1/microservices/estimations/1'
        );
        expect(response.statusCode).toBe(200);
        expect(response.body.idEstimation).toEqual(1);
        expect(response.body.pair).toEqual(testEstimation.pair);
        expect(response.body.from).toEqual(testEstimation.volume);
    });

    it('estimation not found', async () => {
        const response = await request(app).get(
            '/belo/api/v1/microservices/estimations/1'
        );
        expect(response.statusCode).toBe(500);
        expect(response.body.errors).not.toBeNull();
        expect(response.body.errors.length).toBe(1);
        expect(response.body.errors[0]).toEqual({
            msg: 'estimation not found',
        });
    });
});

describe('POST estimations', () => {
    it('create estimation', async () => {
        const response = await request(app)
            .post('/belo/api/v1/microservices/estimations')
            .send(testEstimation);
        expect(response.statusCode).toBe(201);
        expect(response.body.idEstimation).toEqual(1);
        expect(response.body.pair).toEqual(testEstimation.pair);
        expect(response.body.from).toEqual(testEstimation.volume);
    });

    it('create estimation with the negative volume', async () => {
        const response = await request(app)
            .post('/belo/api/v1/microservices/estimations')
            .send({ pair: 'BTC-USDT', volume: -100 });
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).not.toBeNull();
        expect(response.body.errors.length).toBe(1);
        expect(response.body.errors[0]).toEqual({
            msg: 'volume must be greater than zero',
            param: 'volume',
            value: -100,
            location: 'body',
        });
    });
    it('create estimation with the pair empty', async () => {
        const response = await request(app)
            .post('/belo/api/v1/microservices/estimations')
            .send({ pair: '', volume: 50 });
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).not.toBeNull();
        expect(response.body.errors.length).toBe(1);
        expect(response.body.errors[0]).toEqual({
            msg: 'pair does contain invalid value',
            param: 'pair',
            value: '',
            location: 'body',
        });
    });

    it('create estimation with the pair incorrect', async () => {
        const response = await request(app)
            .post('/belo/api/v1/microservices/estimations')
            .send({ pair: 'BTC-USD', volume: 50 });
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).not.toBeNull();
        expect(response.body.errors.length).toBe(1);
        expect(response.body.errors[0]).toEqual({
            msg: 'pair does contain invalid value',
            param: 'pair',
            value: 'BTC-USD',
            location: 'body',
        });
    });

    it('create estimation only with the pair', async () => {
        const response = await request(app)
            .post('/belo/api/v1/microservices/estimations')
            .send({ pair: 'BTC-USDT' });
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).not.toBeNull();
        expect(response.body.errors.length).toBe(2);
        expect(response.body.errors[0]).toEqual({
            msg: 'volume is requiered',
            param: 'volume',
            location: 'body',
        });
        expect(response.body.errors[1]).toEqual({
            msg: 'volume must be greater than zero',
            param: 'volume',
            location: 'body',
        });
    });

    it('create estimation only with the volume', async () => {
        const response = await request(app)
            .post('/belo/api/v1/microservices/estimations')
            .send({ volume: 55 });
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).not.toBeNull();
        expect(response.body.errors.length).toBe(3);
        expect(response.body.errors[0]).toEqual({
            msg: 'pair is requiered',
            param: 'pair',
            location: 'body',
        });
        expect(response.body.errors[1]).toEqual({
            msg: 'pair must be a string',
            param: 'pair',
            location: 'body',
        });
        expect(response.body.errors[2]).toEqual({
            msg: 'pair does contain invalid value',
            param: 'pair',
            location: 'body',
        });
    });
});

describe('POST swap/:estimation', () => {
    it('swap estimation', async () => {
        await request(app)
            .post('/belo/api/v1/microservices/estimations')
            .send(testEstimation);
        const responseSwap = await request(app)
            .post('/belo/api/v1/microservices/estimations/swap/1')
            .send();
        expect(responseSwap.statusCode).toBe(200);
        expect(responseSwap.body.status).toEqual('AWAITING');
    });

    it('estimation not found', async () => {
        const response = await request(app)
            .post('/belo/api/v1/microservices/estimations/swap/1')
            .send();
        expect(response.statusCode).toBe(500);
        expect(response.body.errors).not.toBeNull();
        expect(response.body.errors.length).toBe(1);
        expect(response.body.errors[0]).toEqual({
            msg: 'estimation not found',
        });
    });

    it('estimation executed', async () => {
        await request(app)
            .post('/belo/api/v1/microservices/estimations')
            .send(testEstimation);
        await request(app)
            .post('/belo/api/v1/microservices/estimations/swap/1')
            .send();

        const responseSwap1 = await request(app)
            .post('/belo/api/v1/microservices/estimations/swap/1')
            .send();
        expect(responseSwap1.statusCode).toBe(500);
        expect(responseSwap1.body.errors).not.toBeNull();
        expect(responseSwap1.body.errors.length).toBe(1);
        expect(responseSwap1.body.errors[0]).toEqual({
            msg: 'estimation already executed',
        });
    });
});
