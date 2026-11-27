import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm'
import { User } from '../../auth/entities/user.entity.js';

@Entity()
export class Article {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ unique: true })
    slug: string;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column('text')
    body: string;

    @Column({ type: 'simple-json', default: '[]' })
    tagList: string[];

    @ManyToOne(() => User, (user) => user.articles, { nullable: false, onDelete: 'CASCADE' })
    author: User

    @Column()
    createdAt: Date
}
