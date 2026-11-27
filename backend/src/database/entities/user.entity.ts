import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Client } from './client.entity';
import { Proforma } from './proforma.entity';
import { Invoice } from './invoice.entity';
import { Payment } from './payment.entity';
import { InvoiceCounter } from './invoice-counter.entity';
import { RefreshToken } from './refresh-token.entity';

@Entity('utilisateur')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', unique: true, length: 255 })
  email!: string;

  @Column({
    name: 'mot_de_passe_hash',
    type: 'varchar',
    length: 255,
    select: false,
  })
  passwordHash!: string;

  @Column({ name: 'nom_entreprise', type: 'varchar', length: 255 })
  companyName!: string;

  @Column({
    name: 'forme_juridique',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  legalForm!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  niu!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  rccm!: string | null;

  @Column({ name: 'regime_tva', type: 'varchar', length: 50, nullable: true })
  vatRegime!: string | null;

  @Column({
    name: 'devise_par_defaut',
    type: 'varchar',
    length: 3,
    default: 'XAF',
  })
  defaultCurrency!: string;

  @Column({ name: 'adresse', type: 'varchar', length: 255, nullable: true })
  address!: string | null;

  @Column({ name: 'ville', type: 'varchar', length: 100, nullable: true })
  city!: string | null;

  @Column({ name: 'pays', type: 'varchar', length: 100, nullable: true })
  country!: string | null;

  @Column({ name: 'telephone', type: 'varchar', length: 30, nullable: true })
  phone!: string | null;

  @CreateDateColumn({ name: 'cree_le', type: 'datetime' })
  createdAt!: Date;

  @OneToMany(() => Client, (c) => c.user)
  clients!: Client[];

  @OneToMany(() => Proforma, (p) => p.user)
  proformas!: Proforma[];

  @OneToMany(() => Invoice, (i) => i.user)
  invoices!: Invoice[];

  @OneToMany(() => Payment, (p) => p.user)
  payments!: Payment[];

  @OneToMany(() => InvoiceCounter, (c) => c.user)
  counters!: InvoiceCounter[];

  @OneToMany(() => RefreshToken, (r) => r.user)
  refreshTokens!: RefreshToken[];
}
