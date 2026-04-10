import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
export declare class TransformInterceptor<T> implements NestInterceptor<T, {
    success: boolean;
    data: T;
}> {
    intercept(_: ExecutionContext, next: CallHandler): Observable<{
        success: boolean;
        data: T;
    }>;
}
