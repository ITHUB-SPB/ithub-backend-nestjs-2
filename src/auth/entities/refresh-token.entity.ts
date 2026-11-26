import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

export type Json = object | string | number | boolean | null;

@Entity('refresh_tokens')
@Index('refresh_tokens_family_id_idx', ['familyId'])
@Index('refresh_tokens_user_id_idx', ['userId'])
@Index('refresh_tokens_family_expires_at_idx', ['familyExpiresAt'])
export class RefreshToken {
  @PrimaryColumn({ type: 'text' })
  id: string;

  @Column({ type: 'text', name: 'family_id' })
  familyId: string;

  @Column({ type: 'text', name: 'user_id' })
  userId: string;

  @Column({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'timestamptz', name: 'expires_at' })
  expiresAt: Date;

  @Column({ type: 'timestamptz', name: 'family_expires_at' })
  familyExpiresAt: Date;

  @Column({ type: 'timestamptz', name: 'used_at', nullable: true })
  usedAt: Date | null;

  // A family is revoked when any of its tokens is: that covers a successor saved after the revocation.
  @Column({ type: 'boolean', default: false })
  revoked: boolean;

  @Column({ type: 'jsonb', nullable: true })
  claims: Record<string, Json> | null;
}
