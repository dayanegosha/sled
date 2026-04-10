"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const axios_1 = __importDefault(require("axios"));
const db_service_1 = require("../../database/db.service");
let AuthService = class AuthService {
    jwt;
    config;
    db;
    constructor(jwt, config, db) {
        this.jwt = jwt;
        this.config = config;
        this.db = db;
    }
    async handleVkCallback(params) {
        if (!params.code)
            throw new common_1.UnauthorizedException('Missing VK code');
        const mode = this.config.get('VK_AUTH_MODE') ?? 'vkid';
        let userProfile = null;
        if (mode !== 'legacy') {
            userProfile = await this.tryVkIdFlow(params);
        }
        if (!userProfile) {
            userProfile = await this.tryLegacyFlow(params.code);
        }
        if (!userProfile) {
            throw new common_1.UnauthorizedException('VK user fetch failed');
        }
        const displayName = `${userProfile.firstName} ${userProfile.lastName}`.trim();
        const username = userProfile.username || `id${userProfile.id}`;
        let localUser = {
            id: crypto.randomUUID(),
            vk_id: userProfile.id,
            username,
            display_name: displayName,
            avatar_url: userProfile.avatar ?? null,
            is_admin: false,
        };
        try {
            const { rows } = await this.db.query(`INSERT INTO users (vk_id, username, display_name, avatar_url)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (vk_id)
         DO UPDATE SET username = EXCLUDED.username,
                       display_name = EXCLUDED.display_name,
                       avatar_url = EXCLUDED.avatar_url,
                       updated_at = NOW()
         RETURNING id, vk_id, username, display_name, avatar_url, is_admin`, [userProfile.id, username, displayName, userProfile.avatar ?? null]);
            if (rows[0]) {
                localUser = rows[0];
            }
        }
        catch {
        }
        const accessToken = this.jwt.sign({
            sub: localUser.id,
            id: localUser.id,
            vk_id: localUser.vk_id,
            username: localUser.username,
            display_name: localUser.display_name,
            avatar_url: localUser.avatar_url,
            is_admin: localUser.is_admin,
        }, {
            secret: this.config.get('JWT_SECRET'),
            expiresIn: '15m',
        });
        const refreshToken = this.jwt.sign({ sub: localUser.id, type: 'refresh' }, {
            secret: this.config.get('JWT_REFRESH_SECRET'),
            expiresIn: '30d',
        });
        return { accessToken, refreshToken, user: localUser };
    }
    async tryVkIdFlow(params) {
        const clientId = this.config.get('VK_APP_ID') ?? '';
        const redirectUri = this.config.get('VK_CALLBACK_URL') ?? '';
        if (!clientId || !redirectUri || !params.codeVerifier || !params.deviceId) {
            return null;
        }
        try {
            const body = new URLSearchParams({
                grant_type: 'authorization_code',
                code: params.code,
                code_verifier: params.codeVerifier,
                client_id: clientId,
                device_id: params.deviceId,
                redirect_uri: redirectUri,
                state: params.state ?? '',
            });
            const tokenRes = await axios_1.default.post('https://id.vk.ru/oauth2/auth', body.toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            const accessToken = tokenRes.data.access_token;
            if (!accessToken)
                return null;
            const userBody = new URLSearchParams({
                access_token: accessToken,
                client_id: clientId,
            });
            const userRes = await axios_1.default.post('https://id.vk.ru/oauth2/user_info', userBody.toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            const user = userRes.data.user;
            if (!user)
                return null;
            const id = Number(user.user_id);
            if (!Number.isFinite(id))
                return null;
            return {
                id,
                firstName: user.first_name,
                lastName: user.last_name,
                username: `vkid_${id}`,
                avatar: user.avatar,
            };
        }
        catch {
            return null;
        }
    }
    async tryLegacyFlow(code) {
        const appId = this.config.get('VK_APP_ID') ?? '';
        const secret = this.config.get('VK_APP_SECRET') ?? '';
        const redirectUri = this.config.get('VK_CALLBACK_URL') ?? '';
        if (!appId || !secret || !redirectUri) {
            return null;
        }
        try {
            const tokenRes = await axios_1.default.get('https://oauth.vk.com/access_token', {
                params: {
                    client_id: appId,
                    client_secret: secret,
                    redirect_uri: redirectUri,
                    code,
                },
            });
            const accessToken = tokenRes.data.access_token;
            const userRes = await axios_1.default.get('https://api.vk.com/method/users.get', {
                params: {
                    user_ids: tokenRes.data.user_id,
                    fields: 'screen_name,photo_200',
                    access_token: accessToken,
                    v: '5.199',
                },
            });
            const user = userRes.data.response?.[0];
            if (!user)
                return null;
            return {
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                username: user.screen_name,
                avatar: user.photo_200,
            };
        }
        catch {
            return null;
        }
    }
    refreshTokens(refreshToken) {
        const payload = this.jwt.verify(refreshToken, {
            secret: this.config.get('JWT_REFRESH_SECRET'),
        });
        const accessToken = this.jwt.sign({ sub: payload.sub, is_admin: false }, {
            secret: this.config.get('JWT_SECRET'),
            expiresIn: '15m',
        });
        return { accessToken };
    }
    async getPublicStats() {
        try {
            const [usersRes, distanceRes, regionsRes] = await Promise.all([
                this.db.query('SELECT COUNT(*)::text AS total FROM users'),
                this.db.query('SELECT COALESCE(SUM(total_distance), 0) / 1000.0 AS total_km FROM users'),
                this.db.query('SELECT COUNT(*)::text AS total FROM regions'),
            ]);
            return {
                explorers: Number(usersRes.rows[0]?.total ?? 0),
                totalKm: Math.round(Number(distanceRes.rows[0]?.total_km ?? 0)),
                regions: Number(regionsRes.rows[0]?.total ?? 0),
            };
        }
        catch {
            return {
                explorers: 0,
                totalKm: 0,
                regions: 0,
            };
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        db_service_1.DbService])
], AuthService);
//# sourceMappingURL=auth.service.js.map