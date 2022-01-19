export class Parser {
    public static priceEstimation(response): number {
        try {
            return Number(response.data[0].bids[0][0]);
        } catch (error) {
            throw Error('Error parse price estimation');
        }
    }

    public static feeOkex(response): number {
        try {
            return Math.abs(Number(response.data[0].taker));
        } catch (error) {
            throw Error('Error parse fee okex');
        }
    }

    public static orderId(response): string {
        try {
            return response.data[0].ordId;
        } catch (error) {
            throw Error('Error parse order ID');
        }
    }

    public static priceOrder(response): number {
        try {
            return response.data[0].fillSz == null
                ? null
                : Number(response.data[0].fillSz);
        } catch (error) {
            throw Error('Error parse price order');
        }
    }
}
