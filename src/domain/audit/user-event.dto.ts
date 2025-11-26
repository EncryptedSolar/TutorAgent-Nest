import { Field, ObjectType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class UserEventDTO {
  @Field()
  id: string;

  @Field()
  userId: string;

  @Field(() => String, { nullable: true }) // explicit type required
  sessionId?: string | null;

  @Field()
  action: string;

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: Record<string, any>;

  @Field()
  createdAt: Date;
}
