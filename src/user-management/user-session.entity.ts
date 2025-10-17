import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user_sessions')
export class UserSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ default: false })
  isActive: boolean;

  @Column({ nullable: true })
  ipAddress?: string;

  @Column({ nullable: true })
  userAgent?: string;

  @CreateDateColumn()
  connectedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  disconnectedAt?: Date;
  
  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @UpdateDateColumn()
  updatedAt: Date;
}
