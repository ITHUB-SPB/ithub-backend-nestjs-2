import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, ManyToMany } from 'typeorm'
import { type User } from '../../auth/entities/user.entity.js';

@Entity()
export class Article {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    title: string;

    @ManyToOne('User', (user: User) => user.articles)
    author: User
}
