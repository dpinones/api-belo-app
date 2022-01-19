import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ColumnNumericTransformer } from '../util/columnNumericTransformer';

@Entity()
export class Order {
    @PrimaryGeneratedColumn()
    idOrder: number;

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
        nullable: true,
    })
    to: number;

    @Column('numeric', {
        precision: 30,
        scale: 23,
        transformer: new ColumnNumericTransformer(),
    })
    transactionFee: number;

    @Column()
    timestamp: Date;

    @Column()
    status: string;

    @Column()
    orderIdOkex: string;

    estimation: number;
}
