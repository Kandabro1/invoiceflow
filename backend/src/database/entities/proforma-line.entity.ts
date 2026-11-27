import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Proforma } from './proforma.entity';
import { TaxRate } from './tax-rate.entity';

@Entity('ligne_proforma')
@Index('idx_ligne_proforma_proforma', ['proformaId'])
export class ProformaLine {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'proforma_id' })
  proformaId!: number;

  @ManyToOne(() => Proforma, (p) => p.lines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'proforma_id' })
  proforma!: Proforma;

  @Column({ name: 'taux_tva_id' })
  taxRateId!: number;

  @ManyToOne(() => TaxRate, (t) => t.proformaLines, { onDelete: 'RESTRICT' })
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
}
