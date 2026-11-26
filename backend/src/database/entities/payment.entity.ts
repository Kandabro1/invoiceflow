import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Client } from './client.entity';
import { PaymentAllocation } from './payment-allocation.entity';
import { PaymentMethod } from '../types/enums';

@Entity('paiement')
@Index('idx_paiement_utilisateur', ['userId'])
@Index('idx_paiement_client', ['clientId'])
export class Payment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'utilisateur_id' })
  userId!: number;

  @ManyToOne(() => User, (u) => u.payments, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'utilisateur_id' })
  user!: User;

  @Column({ name: 'client_id' })
  clientId!: number;

  @ManyToOne(() => Client, (c) => c.payments, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'client_id' })
  client!: Client;

  @Column({ name: 'date_paiement', type: 'date' })
  paymentDate!: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount!: string;

  @Column({ type: 'enum', enum: PaymentMethod })
  method!: PaymentMethod;

  @CreateDateColumn({ name: 'cree_le', type: 'datetime' })
  createdAt!: Date;

  @OneToMany(() => PaymentAllocation, (a) => a.payment, { cascade: false })
  allocations!: PaymentAllocation[];
}
