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
import { InvoiceLine } from './invoice-line.entity';
import { Proforma } from './proforma.entity';
import { InvoiceStatus } from '../types/enums';
import { PartySnapshot } from '../types/party-snapshot';

@Entity('facture')
@Index('idx_facture_utilisateur', ['userId'])
@Index('idx_facture_utilisateur_statut', ['userId', 'status'])
@Index('idx_facture_utilisateur_echeance', ['userId', 'dueDate'])
@Index('uq_facture_numero', ['userId', 'number'], { unique: true })
export class Invoice {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'utilisateur_id' })
  userId!: number;

  @ManyToOne(() => User, (u) => u.invoices, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'utilisateur_id' })
  user!: User;

  @Column({ name: 'client_id' })
  clientId!: number;

  @ManyToOne(() => Client, (c) => c.invoices, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'client_id' })
  client!: Client;

  @Column({ name: 'proforma_id', type: 'int', nullable: true })
  proformaId!: number | null;

  @OneToOne(() => Proforma, (p) => p.invoice, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'proforma_id' })
  proforma!: Proforma | null;

  @Column({ name: 'numero', type: 'varchar', length: 20, nullable: true })
  number!: string | null;

  @Column({
    name: 'statut',
    type: 'enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.BROUILLON,
  })
  status!: InvoiceStatus;

  @Column({ name: 'date_emission', type: 'date' })
  issueDate!: string;

  @Column({ name: 'date_echeance', type: 'date' })
  dueDate!: string;

  @Column({ name: 'date_envoi', type: 'datetime', nullable: true })
  sentAt!: Date | null;

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

  @Column({ name: 'emetteur_snapshot', type: 'json', nullable: true })
  issuerSnapshot!: PartySnapshot | null;

  @Column({ name: 'client_snapshot', type: 'json', nullable: true })
  clientSnapshot!: PartySnapshot | null;

  @CreateDateColumn({ name: 'cree_le', type: 'datetime' })
  createdAt!: Date;

  @OneToMany(() => InvoiceLine, (l) => l.invoice, { cascade: false })
  lines!: InvoiceLine[];
}
