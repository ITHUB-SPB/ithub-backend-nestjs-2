import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne } from 'typeorm'
import { Article } from '../../articles/entities/article.entity.js';
import type { Role } from './role.entity.js';

@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ unique: true })
    username: string;

    @Column()
    password: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    bio: string;

    @Column({ default: "default-avatar.png" })
    image: string;

    @Column({ default: false })
    emailVerified: boolean;

    @OneToMany(() => Article, article => article.author)
    articles: Article[]

    @ManyToOne('Role', (role: Role) => role.users)
    role: Role
}