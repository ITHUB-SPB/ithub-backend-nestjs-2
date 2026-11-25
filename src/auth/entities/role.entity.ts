import {  Entity, Column, PrimaryColumn, OneToMany } from 'typeorm'
import { User } from './user.entity.js';

@Entity()
export class Role {
    @PrimaryColumn()
    id: "author" | "moderator" | "superadmin";

    @Column({ unique: true })
    title: string;

    @OneToMany(() => User, user => user.role)
    users: User[]
}