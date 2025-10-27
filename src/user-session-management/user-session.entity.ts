import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum SessionStatus {
  ACTIVE = 'active',
  IDLE = 'idle',
  OFFLINE = 'offline',
  TERMINATED = 'terminated',
}

@Entity('user_sessions')
export class UserSessionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  role: string;

  @Column({ type: 'text', nullable: true })
  jwtId?: string | null;

  @Column({ nullable: true })
  ipAddress?: string;

  @Column({ nullable: true })
  deviceInfo?: string;

  @Column({ nullable: true })
  socketId?: string;

  /**
   * SQLite does not support "enum" columns natively.
   * So for local dev or in-memory setups, we use TEXT
   * and keep the enum type only at the TypeScript level.
   * You can switch this to `type: 'enum'` later for Postgres/MySQL.
   */
  @Column({
    type: 'text',
    default: SessionStatus.ACTIVE,
  })
  status: SessionStatus;

  @Column({
    type: 'datetime', // use "datetime" for better SQLite compatibility
    default: () => 'CURRENT_TIMESTAMP',
  })
  lastActivity: Date;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  terminatedAt?: Date;
}
