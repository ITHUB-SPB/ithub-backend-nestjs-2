import type { EmailTokenPurpose } from '@nestjs/authentication';
import { Column, Entity, Index, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity('email_tokens')
@Index('email_tokens_user_id_purpose_idx', ['userId', 'purpose'])
@Index('email_tokens_expires_at_idx', ['expiresAt'])
export class EmailToken {
  @PrimaryColumn({ type: 'text' })
  id: string;

  @Column({ type: 'text' })
  purpose: EmailTokenPurpose;

  @Column({ type: 'text', name: 'user_id' })
  userId: string;

  @Column({ type: 'text' })
  email: string;

  @Column({ type: 'text', nullable: true })
  fingerprint: string | null;

  @Column({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'timestamptz', name: 'expires_at' })
  expiresAt: Date;
}