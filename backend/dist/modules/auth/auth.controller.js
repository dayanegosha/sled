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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const auth_service_1 = require("./auth.service");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
function base64Url(buffer) {
    return buffer
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '');
}
function generateCodeVerifier() {
    return base64Url((0, crypto_1.randomBytes)(64));
}
function createCodeChallenge(verifier) {
    return base64Url((0, crypto_1.createHash)('sha256').update(verifier).digest());
}
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    initiateVkOAuth(next, res) {
        const state = base64Url((0, crypto_1.randomBytes)(32));
        const codeVerifier = generateCodeVerifier();
        const codeChallenge = createCodeChallenge(codeVerifier);
        res.cookie('vk_state', state, {
            httpOnly: true,
            sameSite: 'lax',
            path: '/api/v1/auth/vk/callback',
            maxAge: 10 * 60 * 1000,
        });
        res.cookie('vk_code_verifier', codeVerifier, {
            httpOnly: true,
            sameSite: 'lax',
            path: '/api/v1/auth/vk/callback',
            maxAge: 10 * 60 * 1000,
        });
        if (next && next.startsWith('/')) {
            res.cookie('vk_next', next, {
                httpOnly: true,
                sameSite: 'lax',
                path: '/api/v1/auth/vk/callback',
                maxAge: 10 * 60 * 1000,
            });
        }
        const params = new URLSearchParams({
            response_type: 'code',
            client_id: process.env.VK_APP_ID ?? '',
            redirect_uri: process.env.VK_CALLBACK_URL ?? '',
            scope: 'vkid.personal_info email',
            state,
            code_challenge: codeChallenge,
            code_challenge_method: 'S256',
            lang_id: '0',
            scheme: 'dark',
        });
        return res.redirect(`https://id.vk.ru/authorize?${params}`);
    }
    async vkCallback(codeRaw, error, stateRaw, deviceIdRaw, payloadRaw, res) {
        if (error) {
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=vk_denied`);
        }
        let code = codeRaw;
        let state = stateRaw;
        let deviceId = deviceIdRaw;
        if (payloadRaw) {
            try {
                const payload = JSON.parse(payloadRaw);
                code = payload.code ?? code;
                state = payload.state ?? state;
                deviceId = payload.device_id ?? deviceId;
            }
            catch {
            }
        }
        const expectedState = res.req.cookies?.vk_state;
        const codeVerifier = res.req.cookies?.vk_code_verifier;
        const next = res.req.cookies?.vk_next;
        res.clearCookie('vk_state', { path: '/api/v1/auth/vk/callback' });
        res.clearCookie('vk_code_verifier', { path: '/api/v1/auth/vk/callback' });
        res.clearCookie('vk_next', { path: '/api/v1/auth/vk/callback' });
        if (!code || !state || !expectedState || state !== expectedState) {
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=invalid_state`);
        }
        const { accessToken, refreshToken } = await this.authService.handleVkCallback({
            code,
            codeVerifier,
            deviceId,
            state,
        });
        res.cookie('access_token', accessToken, {
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            secure: process.env.NODE_ENV === 'production',
        });
        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            sameSite: 'lax',
            path: '/api/v1/auth/refresh',
            secure: process.env.NODE_ENV === 'production',
        });
        const target = next && next.startsWith('/') ? next : '/map';
        return res.redirect(`${process.env.FRONTEND_URL}${target}`);
    }
    logout(res) {
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');
        return { message: 'Logged out' };
    }
    me(user) {
        return user;
    }
    getPublicStats() {
        return this.authService.getPublicStats();
    }
    async vkSdkExchange(body, res) {
        const { accessToken, refreshToken } = await this.authService.handleVkCallback({
            code: body.code,
            state: body.state,
            deviceId: body.deviceId,
            codeVerifier: body.codeVerifier,
        });
        res.cookie('access_token', accessToken, {
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            secure: process.env.NODE_ENV === 'production',
        });
        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            sameSite: 'lax',
            path: '/api/v1/auth/refresh',
            secure: process.env.NODE_ENV === 'production',
        });
        return {
            ok: true,
            next: body.next && body.next.startsWith('/') ? body.next : '/map',
        };
    }
    async refresh(res) {
        const token = res.req.cookies?.refresh_token;
        if (!token)
            throw new common_1.UnauthorizedException();
        const { accessToken } = this.authService.refreshTokens(token);
        res.cookie('access_token', accessToken, {
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
        });
        return res.json({ ok: true });
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Get)('vk'),
    __param(0, (0, common_1.Query)('next')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "initiateVkOAuth", null);
__decorate([
    (0, common_1.Get)('vk/callback'),
    __param(0, (0, common_1.Query)('code')),
    __param(1, (0, common_1.Query)('error')),
    __param(2, (0, common_1.Query)('state')),
    __param(3, (0, common_1.Query)('device_id')),
    __param(4, (0, common_1.Query)('payload')),
    __param(5, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "vkCallback", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "me", null);
__decorate([
    (0, common_1.Get)('public-stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getPublicStats", null);
__decorate([
    (0, common_1.Post)('vk/sdk-exchange'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "vkSdkExchange", null);
__decorate([
    (0, common_1.Post)('refresh'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map