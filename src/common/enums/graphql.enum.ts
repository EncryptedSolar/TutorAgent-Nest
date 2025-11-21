import { registerEnumType } from '@nestjs/graphql';
import { Channel, Role, SessionStatus } from 'generated/prisma/client';
/* These are needed, otherwise, typescript will complain on incompabitlity. Imported at app.module so that all the dtos that 
as these types dosnt have to call it again. */
registerEnumType(Role, { name: 'Role', description: 'User role' });
registerEnumType(Channel, { name: 'Channel', description: 'Session channel' });
registerEnumType(SessionStatus, { name: 'SessionStatus', description: 'Session status' });
