import type { Response } from 'express';
import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    initiateVkOAuth(next: string | undefined, res: Response): void;
    vkCallback(codeRaw: string, error: string, stateRaw: string, deviceIdRaw: string, payloadRaw: string, res: Response): Promise<void>;
    logout(res: Response): {
        message: string;
    };
    me(user: any): any;
    getPublicStats(): Promise<{
        explorers: number;
        totalKm: number;
        regions: number;
    }>;
    vkSdkExchange(body: {
        code: string;
        state?: string;
        deviceId?: string;
        codeVerifier?: string;
        next?: string;
    }, res: Response): Promise<{
        ok: boolean;
        next: string;
    }>;
    refresh(res: Response): Promise<Response<any, Record<string, any>>>;
}
