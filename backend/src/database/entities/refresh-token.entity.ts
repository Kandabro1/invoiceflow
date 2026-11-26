import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('refresh_token')
@Index('idx_refresh_token_utilisateur', ['userId'])
@Index('idx_refresh_token_hash', ['tokenHash'], { unique: true })
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'utilisateur_id' })
  userId!: number;

  @ManyToOne(() => User, (u) => u.refreshTokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'utilisateur_id' })
  user!: User;

  @Column({ name: 'token_hash', type: 'varchar', length: 255 })
  tokenHash!: string;

  @Column({ name: 'expire_le', type: 'datetime' })
  expiresAt!: Date;

  @Column({ name: 'revoque_le', type: 'datetime', nullable: true })
  revokedAt!: Date | null;

  @CreateDateColumn({ name: 'cree_le', type: 'datetime' })
  createdAt!: Date;
}
