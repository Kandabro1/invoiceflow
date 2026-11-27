import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Invoice } from './invoice.entity';
import { TaxRate } from './tax-rate.entity';

@Entity('ligne_facture')
@Index('idx_ligne_facture_facture', ['invoiceId'])
export class InvoiceLine {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'facture_id' })
  invoiceId!: number;

  @ManyToOne(() => Invoice, (i) => i.lines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'facture_id' })
  invoice!: Invoice;

  @Column({ name: 'taux_tva_id' })
  taxRateId!: number;

  @ManyToOne(() => TaxRate, (t) => t.invoiceLines, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'taux_tva_id' })
  taxRate!: TaxRate;

  @Column({ type: 'int' })
  position!: number;

  @Column({ type: 'text' })
  description!: string;

  @Column({ name: 'quantite', type: 'decimal', precision: 12, scale: 3 })
  quantity!: string;

  @Column({
    name: 'prix_unitaire_ht',
    type: 'decimal',
    precision: 15,
    scale: 2,
  })
  unitPriceHt!: string;

  @Column({ name: 'taux_applique', type: 'decimal', precision: 5, scale: 2 })
  appliedRate!: string;
}
