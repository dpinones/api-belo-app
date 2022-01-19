import { getRepository } from 'typeorm';
import { Estimation } from '../entity/estimation';

export class EstimationRepository {
    private estimationRepository = getRepository(Estimation);

    public async all() {
        try {
            return await this.estimationRepository.find();
        } catch (error) {
            throw Error('EstimationRepository Error BD all');
        }
    }

    public async findOne(id) {
        try {
            return await this.estimationRepository.findOne(id);
        } catch (error) {
            throw Error('EstimationRepository Error BD findOne');
        }
    }

    public async save(estimation) {
        try {
            return await this.estimationRepository.save(
                this.estimationRepository.create(estimation)
            );
        } catch (error) {
            throw Error('EstimationRepository Error BD save');
        }
    }

    public async update(estimation: Estimation) {
        try {
            return await this.estimationRepository.save(estimation);
        } catch (error) {
            throw Error('EstimationRepository Error BD update');
        }
    }
}
