import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

export type Json = object | string | number | boolean | null;

@Entity('sessions')
@Index('sessions_user_id_idx', ['userId'])
@Index('sessions_expires_at_idx', ['expiresAt'])
export class Session {
    @PrimaryColumn({ type: 'text' })
    id: string;

    @Column({ type: 'text', name: 'user_id' })
    userId: string;

    @Column({ type: 'timestamptz', name: 'created_at' })
    createdAt: Date;

    @Column({ type: 'timestamptz', name: 'expires_at' })
    expiresAt: Date;

    @Column({ type: 'timestamptz', name: 'last_active_at' })
    lastActiveAt: Date;

    @Column({ type: 'text', nullable: true, default: null })
    mfa: null;

    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, Json> | null;
}