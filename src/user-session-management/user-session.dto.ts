// user-session/dto/user-session.dto.ts
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Channel, SessionStatus } from 'generated/prisma/client';
import { UserDTO } from 'src/user/user.dto';

@ObjectType()
export class UserSessionDTO {
  @Field(() => ID)
  id: string;

  @Field()
  role: string;

  @Field(() => UserDTO)
  user: UserDTO;

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

  // 🆕 Future space for component/activity tracking
  @Field({ nullable: true })
  currentComponent?: string;

  @Field({ nullable: true })
  lastComponentActivityAt?: Date;
}
