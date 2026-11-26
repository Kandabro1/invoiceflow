import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ProformaLine } from './proforma-line.entity';
import { InvoiceLine } from './invoice-line.entity';

@Entity('taux_tva')
export class TaxRate {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', unique: true, length: 50 })
  code!: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  rate!: string;

  @Column({ name: 'est_exonere', type: 'boolean', default: false })
  isExempt!: boolean;

  @OneToMany(() => ProformaLine, (l) => l.taxRate)
  proformaLines!: ProformaLine[];

  @OneToMany(() => InvoiceLine, (l) => l.taxRate)
  invoiceLines!: InvoiceLine[];
}
