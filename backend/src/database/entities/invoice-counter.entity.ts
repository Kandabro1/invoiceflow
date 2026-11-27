import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('compteur_facture')
export class InvoiceCounter {
  @PrimaryColumn({ name: 'utilisateur_id' })
  userId!: number;

  @ManyToOne(() => User, (u) => u.counters, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'utilisateur_id' })
  user!: User;

  @PrimaryColumn({ name: 'annee', type: 'int' })
  year!: number;

  @PrimaryColumn({ name: 'mois', type: 'int' })
  month!: number;

  @Column({ name: 'dernier_numero', type: 'int', default: 0 })
  lastNumber!: number;
}
