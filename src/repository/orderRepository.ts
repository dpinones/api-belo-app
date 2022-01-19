import e = require('express');
import { getRepository } from 'typeorm';
import { Order } from '../entity/order';

export class OrderRepository {
    private orderRepository = getRepository(Order);

    public async all() {
        try {
            return await this.orderRepository.find();
        } catch (error) {
            throw Error('OrderRepository Error BD all');
        }
    }

    public async findOne(id) {
        try {
            return await this.orderRepository.findOne(id);
        } catch (error) {
            throw Error('OrderRepository Error BD findOne');
        }
    }

    public async save(estimation) {
        try {
            return await this.orderRepository.save(
                this.orderRepository.create(estimation)
            );
        } catch (error) {
            throw Error('OrderRepository Error BD save');
        }
    }

    public async update(order: Order) {
        try {
            return await this.orderRepository.save(order);
        } catch (error) {
            throw Error('OrderRepository Error BD update');
        }
    }
}
