// user‑session/dto/user‑session.dto.ts
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { SessionStatus, Channel } from '@prisma/client';

// Register enums
registerEnumType(SessionStatus, { name: 'SessionStatus' });
registerEnumType(Channel, { name: 'Channel' });

@ObjectType()
export class UserSessionDTO {
  @Field(() => ID)
  id: string;

  @Field()
  userId: string;

  @Field()
  role: string;

  @Field({ nullable: true })
  jwtId?: string;

  @Field({ nullable: true })
  ipAddress?: string;

  @Field({ nullable: true })
  deviceInfo?: string;

  @Field({ nullable: true })
  socketId?: string;

  @Field(() => Channel, { nullable: true })
  channel?: Channel;

  @Field(() => SessionStatus)
  status: SessionStatus;

  @Field()
  lastActivity: Date;

  @Field()
  loginAt: Date;

  @Field({ nullable: true })
  terminatedAt?: Date;

  @Field({ nullable: true })
  duration?: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
