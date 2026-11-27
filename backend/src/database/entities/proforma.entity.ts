import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Client } from './client.entity';
import { ProformaLine } from './proforma-line.entity';
import { Invoice } from './invoice.entity';
import { ProformaStatus } from '../types/enums';

@Entity('proforma')
@Index('idx_proforma_utilisateur', ['userId'])
@Index('idx_proforma_reference', ['userId', 'reference'], { unique: true })
export class Proforma {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'utilisateur_id' })
  userId!: number;

  @ManyToOne(() => User, (u) => u.proformas, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'utilisateur_id' })
  user!: User;

  @Column({ name: 'client_id' })
  clientId!: number;

  @ManyToOne(() => Client, (c) => c.proformas, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'client_id' })
  client!: Client;

  @Column({ name: 'reference', type: 'varchar', length: 50 })
  reference!: string;

  @Column({
    name: 'statut',
    type: 'enum',
    enum: ProformaStatus,
    default: ProformaStatus.BROUILLON,
  })
  status!: ProformaStatus;

  @Column({ name: 'date_emission', type: 'date', nullable: true })
  issueDate!: string | null;

  @Column({ name: 'date_validite', type: 'date', nullable: true })
  validUntil!: string | null;

  @Column({ name: 'devise', type: 'varchar', length: 3, default: 'XAF' })
  currency!: string;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({
    name: 'montant_ht',
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: '0.00',
  })
  totalHt!: string;

  @Column({
    name: 'montant_tva',
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: '0.00',
  })
  totalVat!: string;

  @Column({
    name: 'montant_ttc',
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: '0.00',
  })
  totalTtc!: string;

  @CreateDateColumn({ name: 'cree_le', type: 'datetime' })
  createdAt!: Date;

  @OneToMany(() => ProformaLine, (l) => l.proforma, { cascade: false })
  lines!: ProformaLine[];

  @OneToOne(() => Invoice, (i) => i.proforma, { nullable: true })
  invoice!: Invoice | null;
}
