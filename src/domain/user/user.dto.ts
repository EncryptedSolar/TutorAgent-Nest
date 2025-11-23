// user/dto/user.dto.ts
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Role } from 'generated/prisma/client';

@ObjectType()
export class UserDTO {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field()
  name: string;

  @Field()
  username: string;

  @Field(() => Role)
  role: Role;

  @Field({ nullable: true })
  picture?: string;

  @Field({ nullable: true })
  isGoogleUser?: boolean;
}
