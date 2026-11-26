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
import { Proforma } from './proforma.entity';
import { Invoice } from './invoice.entity';
import { Payment } from './payment.entity';
import { ClientType } from '../types/enums';

@Entity('client')
@Index('idx_client_utilisateur', ['userId'])
export class Client {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'utilisateur_id' })
  userId!: number;

  @ManyToOne(() => User, (u) => u.clients, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'utilisateur_id' })
  user!: User;

  @Column({ name: 'type_client', type: 'enum', enum: ClientType })
  type!: ClientType;

  @Column({ length: 255 })
  name!: string;

  @Column({ length: 255, nullable: true })
  email!: string | null;

  @Column({ length: 50, nullable: true })
  niu!: string | null;

  @Column({ length: 255, nullable: true })
  address!: string | null;

  @Column({ length: 100, nullable: true })
  city!: string | null;

  @Column({ length: 100, nullable: true })
  country!: string | null;

  @Column({ length: 30, nullable: true })
  phone!: string | null;

  @Column({ name: 'est_archive', default: false })
  isArchived!: boolean;

  @CreateDateColumn({ name: 'cree_le', type: 'datetime' })
  createdAt!: Date;

  @OneToMany(() => Proforma, (p) => p.client)
  proformas!: Proforma[];

  @OneToMany(() => Invoice, (i) => i.client)
  invoices!: Invoice[];

  @OneToMany(() => Payment, (p) => p.client)
  payments!: Payment[];
}
