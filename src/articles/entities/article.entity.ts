import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, ManyToMany, BeforeInsert } from 'typeorm'
import { type User } from '../../auth/entities/user.entity.js';

@Entity()
export class Article {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    title: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'text' })
    body: string;

    @Column('simple-array', { default: '' })
    tagList: string[];


    @ManyToOne('User', (user: User) => user.articles, { cascade: true })
    author: User

    @Column({ nullable: true })
    slug: string;

    @Column({ nullable: true })
    createdAt: Date

    @BeforeInsert()
    setCreatedAt() {
        this.createdAt = new Date()
    }

    @BeforeInsert()
    setSlug() {
        const words = this.title.replaceAll(/[^\w]/g, ' ').trim().split(/\s+/)
        this.slug = words.join('-').toLowerCase()
    }
}
