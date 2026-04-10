import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QueryResult, QueryResultRow } from 'pg';
export declare class DbService implements OnModuleInit, OnModuleDestroy {
    private readonly config;
    private pool;
    constructor(config: ConfigService);
    onModuleInit(): void;
    query<T extends QueryResultRow = any>(sql: string, params?: any[]): Promise<QueryResult<T>>;
    onModuleDestroy(): Promise<void>;
}
