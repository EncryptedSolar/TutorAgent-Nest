import { Field, ObjectType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class UserEventDTO {
  @Field()
  id: string;

  @Field()
  userId: string;

  @Field({ nullable: true })
  sessionId?: string;

  @Field()
  component: string;

  @Field()
  action: string;

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: Record<string, any>;

  @Field()
  createdAt: Date;
}
