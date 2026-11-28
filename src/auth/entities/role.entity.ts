import {  Entity, Column, PrimaryColumn, OneToMany } from 'typeorm'
import { User } from './user.entity.js';

export type RoleId = "author" | "moderator" | "superadmin"

@Entity()
export class Role {
    @PrimaryColumn()
    id: RoleId;

    @Column({ unique: true })
    title: string;

    @OneToMany(() => User, user => user.role)
    users: User[]
}