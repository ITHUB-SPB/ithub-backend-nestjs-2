import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'

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
}