import axios, { Method } from 'axios';
import * as crypto from 'crypto-js';
import { Estimation } from '../entity/estimation';

export class OkexService {
    private baseUrl: string;
    private accessKey: string;
    private secretKey: string;
    private passphrase: string;
    private enviroment: string;

    constructor() {
        this.baseUrl = process.env.BASE_URL;
        this.accessKey = process.env.ACCESS_KEY;
        this.secretKey = process.env.SECRET_KEY;
        this.passphrase = process.env.PASSPHRASE;
        if (process.env.ENVIROMENT == 'DEVELOPMENT') {
            this.enviroment = '1';
        } else {
            this.enviroment = '0';
        }
    }

    public async getEstimations(pair: string, volume: number) {
        const path =
            '/api/v5/market/books?instId=' + pair + '&?sz=' + volume.toString();
        return await this.callApiOkex(path, 'GET', null);
    }

    public async getEstimationByOrderIDOkex(orderId: string) {
        const path =
            '/api/v5/trade/fills?t=' +
            new Date().getTime() +
            '&ordId=' +
            orderId;
        return await this.callApiOkex(path, 'GET', null);
    }

    public async getFee(pair: string) {
        const path = '/api/v5/account/trade-fee?instType=SWAP&uly=' + pair;
        return await this.callApiOkex(path, 'GET', null);
    }

    public async postSwap(estimation: Estimation, fee: number) {
        const path = '/api/v5/trade/order';
        return await this.callApiOkex(
            path,
            'POST',
            JSON.stringify({
                instId: estimation.pair,
                tdMode: 'cash',
                side: 'buy',
                ordType: 'market',
                sz: estimation.from - fee,
                tgtCcy: 'quote_ccy',
            })
        );
    }

    private async callApiOkex(path: string, method: string, body: string) {
        const date: Date = new Date();
        const sign = crypto.enc.Base64.stringify(
            crypto.HmacSHA256(
                date.toISOString() + method + path + body,
                this.secretKey
            )
        );
        try {
            const response = await axios(this.baseUrl + path, {
                method: <Method>method,
                headers: {
                    'OK-ACCESS-KEY': this.accessKey,
                    'OK-ACCESS-SIGN': sign,
                    'OK-ACCESS-TIMESTAMP': date.toISOString(),
                    'OK-ACCESS-PASSPHRASE': this.passphrase,
                    'Content-Type': 'application/json',
                    'x-simulated-trading': this.enviroment,
                },
                data: body,
                timeout: 3000,
            });
            return response.data;
        } catch (error) {
            let ret: string;
            if (error.response) {
                ret = error;
                /*'Error calling API Okex: ' +
                    error.response.data.msg +
                    ', code: ' +
                    error.response.data.code +
                    ', path: ' +
                    path;*/
            } else {
                ret = error;
            }
            throw Error(ret);
        }
    }
}
