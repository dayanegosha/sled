import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, QueryResult, QueryResultRow } from 'pg';

@Injectable()
export class DbService implements OnModuleInit, OnModuleDestroy {
  private pool!: Pool;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    this.pool = new Pool({
      host: this.config.get<string>('DB_HOST'),
      port: this.config.get<number>('DB_PORT'),
      user: this.config.get<string>('DB_USER'),
      password: this.config.get<string>('DB_PASS'),
      database: this.config.get<string>('DB_NAME'),
    });
  }

  async query<T extends QueryResultRow = QueryResultRow>(
    sql: string,
    params: unknown[] = [],
  ): Promise<QueryResult<T>> {
    return this.pool.query<T>(sql, params);
  }

  async onModuleDestroy() {
    await this.pool?.end();
  }
}
