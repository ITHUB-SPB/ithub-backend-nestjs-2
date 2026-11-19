import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm'
import { Article } from '../../articles/entities/article.entity.js';

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

    @OneToMany(() => Article, article => article.author)
    articles: Article[]
}