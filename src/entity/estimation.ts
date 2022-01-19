import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ColumnNumericTransformer } from '../util/columnNumericTransformer';

@Entity()
export class Estimation {
    @PrimaryGeneratedColumn()
    idEstimation: number;

    @Column()
    pair: string;

    @Column('numeric', {
        precision: 30,
        scale: 23,
        transformer: new ColumnNumericTransformer(),
    })
    from: number;

    @Column('numeric', {
        precision: 30,
        scale: 23,
        transformer: new ColumnNumericTransformer(),
    })
    to: number;

    @Column('numeric', {
        precision: 30,
        scale: 23,
        transformer: new ColumnNumericTransformer(),
    })
    transactionFee: number;

    @Column()
    timestampLimit: Date;

    @Column()
    status: string;
}
