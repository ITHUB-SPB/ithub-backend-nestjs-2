
import { Injectable } from '@nestjs/common';

import {
    AuthenticationStorage,
    type EmailTokenPurpose,
    type EmailTokenRecord,
    type EmailTokenStore,
    type RefreshTokenRecord,
    type RefreshTokenStore,
    type SessionRecord,
    type SessionStore,
} from '@nestjs/authentication';

import {
    DataSource,
    IsNull,
    LessThan,
    LessThanOrEqual,
    type EntityTarget,
    type FindOptionsWhere,
    type ObjectLiteral,
} from 'typeorm';

import { Session, type Json } from '../entities/session.entity.js'
import { RefreshToken } from '../entities/refresh-token.entity.js'
import { EmailToken } from '../entities/email-token.entity.js'


@Injectable()
export class AuthenticationStore implements SessionStore, RefreshTokenStore, EmailTokenStore {
    /** Pending links and logins kept per table: anyone can create them. */
    protected readonly maxPending: number = 100_000;

    constructor(
        private readonly dataSource: DataSource,
        storage: AuthenticationStorage,
    ) {
        storage.registerSource({
            sessions: this,
            refreshTokens: this,
            emailTokens: this,
        });
    }

    private get manager() {
        return this.dataSource.manager;
    }

    // Sessions

    async getSession(id: string): Promise<SessionRecord | undefined> {
        const row = await this.manager.findOneBy(Session, { id });
        return row ? withoutNulls(row) : undefined;
    }

    async createSession(record: SessionRecord): Promise<void> {
        // JSON-safe: the package stores what `session.metadata` returned, as JSON.
        const metadata = (record.metadata ?? null) as Record<string, Json> | null;
        await this.manager.insert(Session, { ...record, mfa: null, metadata });
        await this.manager.delete(Session, { expiresAt: LessThanOrEqual(record.createdAt) });
    }

    async touchSession(id: string, lastActiveAt: Date): Promise<void> {
        // Conditional: a session deleted by a sign-out stays deleted.
        await this.manager.update(Session, { id, lastActiveAt: LessThan(lastActiveAt) }, { lastActiveAt });
    }

    // Whether this call deleted it: of two rotations of a session, or a rotation and a sign-out, one wins.
    async deleteSession(id: string): Promise<boolean> {
        const { affected } = await this.manager.delete(Session, { id });
        return (affected ?? 0) > 0;
    }

    async listUserSessions(userId: string): Promise<SessionRecord[]> {
        const rows = await this.manager.findBy(Session, { userId });
        return rows.map(withoutNulls);
    }

    async deleteUserSessions(userId: string): Promise<void> {
        await this.manager.delete(Session, { userId });
    }

    // Refresh tokens

    async getRefreshToken(id: string): Promise<RefreshTokenRecord | undefined> {
        const row = await this.manager.findOneBy(RefreshToken, { id });
        if (!row) {
            return undefined;
        }
        const { revoked: _, ...token } = row;
        return withoutNulls(token);
    }

    async saveRefreshToken(record: RefreshTokenRecord): Promise<void> {
        const claims = (record.claims ?? null) as Record<string, Json> | null;
        await this.manager.insert(RefreshToken, { ...record, usedAt: record.usedAt ?? null, claims });
        await this.manager.delete(RefreshToken, { familyExpiresAt: LessThanOrEqual(record.createdAt) });
    }

    async markRefreshTokenUsed(id: string, at: Date): Promise<boolean> {
        // Conditional: of two refreshes with the same token, one updates the row.
        const { affected } = await this.manager.update(RefreshToken, { id, usedAt: IsNull() }, { usedAt: at });
        return affected === 1;
    }

    async revokeRefreshTokenFamily(familyId: string): Promise<void> {
        await this.manager.update(RefreshToken, { familyId }, { revoked: true });
    }

    isRefreshTokenFamilyRevoked(familyId: string): Promise<boolean> {
        return this.manager.existsBy(RefreshToken, { familyId, revoked: true });
    }

    async revokeUserRefreshTokens(userId: string): Promise<void> {
        await this.manager.update(RefreshToken, { userId }, { revoked: true });
    }

    // Password reset and email verification links

    async saveEmailToken(record: EmailTokenRecord): Promise<void> {
        await this.manager.insert(EmailToken, { ...record, fingerprint: record.fingerprint ?? null });
        await this.trim(EmailToken, record.createdAt);
    }

    async consumeEmailToken(id: string, purpose: EmailTokenPurpose): Promise<EmailTokenRecord | undefined> {
        const [row] = await this.deleteReturning(EmailToken, { id, purpose });
        return row && withoutNulls(row);
    }

    async deleteUserEmailTokens(userId: string, purpose: EmailTokenPurpose): Promise<void> {
        await this.manager.delete(EmailToken, { userId, purpose });
    }

    /** `DELETE … RETURNING *`, as rows of the entity: the query builder returns raw column names. */
    private async deleteReturning<T extends ObjectLiteral>(entity: EntityTarget<T>, where: FindOptionsWhere<T>): Promise<T[]> {
        const { raw } = await this.manager.createQueryBuilder().delete().from(entity).where(where).returning('*').execute();
        const columns = this.dataSource.getMetadata(entity).columns;
        return (raw as Record<string, unknown>[]).map(
            (row) => Object.fromEntries(columns.map((column) => [column.propertyName, row[column.databaseName]])) as T,
        );
    }

    /** Deletes what expired, and past `maxPending`, what expires first. */
    private async trim<T extends { expiresAt: Date }>(entity: EntityTarget<T>, now: Date) {
        await this.manager.delete(entity, { expiresAt: LessThanOrEqual(now) } as FindOptionsWhere<T>);
        const [cutoff] = await this.manager.find(entity, {
            select: { expiresAt: true } as never,
            order: { expiresAt: 'DESC' } as never,
            skip: this.maxPending,
            take: 1,
        });
        if (cutoff) {
            await this.manager.delete(entity, { expiresAt: LessThanOrEqual(cutoff.expiresAt) } as FindOptionsWhere<T>);
        }
    }
}

/** A row without its NULL columns: the package's records leave optional fields out. */
type WithoutNulls<T> = { [K in keyof T as null extends T[K] ? never : K]: T[K] } & {
    [K in keyof T as null extends T[K] ? K : never]?: Exclude<T[K], null>;
};

function withoutNulls<T extends object>(row: T): WithoutNulls<T> {
    return Object.fromEntries(Object.entries(row).filter(([, value]) => value !== null)) as WithoutNulls<T>;
}
