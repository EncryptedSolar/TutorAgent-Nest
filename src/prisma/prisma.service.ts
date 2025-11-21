import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from 'generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private static instance: PrismaService;

  constructor() {
    const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL });
    super({ adapter });
    if (PrismaService.instance) return PrismaService.instance;
    PrismaService.instance = this;
  }


  async onModuleInit() {
    if (!(this as any)._connected) {
      await this.$connect();
      (this as any)._connected = true;
      console.log('✅ Prisma connected');
    }
  }

  async onModuleDestroy() {
    if ((this as any)._connected) {
      await this.$disconnect();
      (this as any)._connected = false;
      console.log('🛑 Prisma disconnected');
    }
  }
}
