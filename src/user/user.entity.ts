import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password?: string;

  @Column()
  role: 'USER' | 'ADMIN';

  @Column()
  name: string;

  @Column({ unique: true })
  username: string;

  // Store hashed refresh token for security
  @Column({ type: 'text', nullable: true })
  refreshTokenHash: string | null;

  @Column({ default: false })
  isGoogleUser: boolean;

  // ✅ Optional profile picture URL
  @Column({ nullable: true })
  picture?: string | null;
}
