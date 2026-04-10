import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { DbService } from '../../database/db.service';
type LocalUser = {
    id: string;
    vk_id: number;
    username: string;
    display_name: string;
    avatar_url: string | null;
    is_admin: boolean;
};
export declare class AuthService {
    private readonly jwt;
    private readonly config;
    private readonly db;
    constructor(jwt: JwtService, config: ConfigService, db: DbService);
    handleVkCallback(params: {
        code: string;
        codeVerifier?: string;
        deviceId?: string;
        state?: string;
    }): Promise<{
        accessToken: string;
        refreshToken: string;
        user: LocalUser;
    }>;
    private tryVkIdFlow;
    private tryLegacyFlow;
    refreshTokens(refreshToken: string): {
        accessToken: string;
    };
    getPublicStats(): Promise<{
        explorers: number;
        totalKm: number;
        regions: number;
    }>;
}
export {};
