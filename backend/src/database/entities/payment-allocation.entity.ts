import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Payment } from './payment.entity';
import { Invoice } from './invoice.entity';

@Entity('allocation_paiement')
@Index('idx_allocation_paiement', ['paymentId'])
@Index('idx_allocation_facture', ['invoiceId'])
export class PaymentAllocation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'paiement_id' })
  paymentId!: number;

  @ManyToOne(() => Payment, (p) => p.allocations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'paiement_id' })
  payment!: Payment;

  @Column({ name: 'facture_id' })
  invoiceId!: number;

  @ManyToOne(() => Invoice, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'facture_id' })
  invoice!: Invoice;

  @Column({ name: 'montant_alloue', type: 'decimal', precision: 15, scale: 2 })
  amount!: string;
}
