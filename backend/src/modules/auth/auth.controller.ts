import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import type { Response } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/types/auth-user';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

const ACCESS_MAX_AGE = 15 * 60 * 1000;
const REFRESH_MAX_AGE = 30 * 24 * 60 * 60 * 1000;

function base64Url(buffer: Buffer) {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function generateCodeVerifier() {
  return base64Url(randomBytes(64));
}

function createCodeChallenge(verifier: string) {
  return base64Url(createHash('sha256').update(verifier).digest());
}

const pendingAuth = new Map<
  string,
  { codeVerifier: string; next: string; createdAt: number }
>();

const adminLoginFails = new Map<string, number>();
const adminBannedIps = new Set<string>();

setInterval(() => {
  const now = Date.now();
  for (const [key, val] of pendingAuth) {
    if (now - val.createdAt > 10 * 60 * 1000) pendingAuth.delete(key);
  }
}, 60_000);

function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
) {
  const secure = process.env.NODE_ENV === 'production';
  res.cookie('access_token', accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure,
    maxAge: ACCESS_MAX_AGE,
  });
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/api/v1/auth',
    secure,
    maxAge: REFRESH_MAX_AGE,
  });
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('vk')
  initiateVkOAuth(
    @Query('next') next: string | undefined,
    @Res() res: Response,
  ) {
    const state = base64Url(randomBytes(32));
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = createCodeChallenge(codeVerifier);

    pendingAuth.set(state, {
      codeVerifier,
      next: next && next.startsWith('/') ? next : '/map',
      createdAt: Date.now(),
    });

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: process.env.VK_APP_ID ?? '',
      redirect_uri: process.env.VK_CALLBACK_URL ?? '',
      scope: 'vkid.personal_info',
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      lang_id: '0',
      scheme: 'dark',
    });

    return res.redirect(`https://id.vk.ru/authorize?${params}`);
  }

  @Get('vk/callback')
  async vkCallback(
    @Query('code') codeRaw: string,
    @Query('error') error: string,
    @Query('state') stateRaw: string,
    @Query('device_id') deviceIdRaw: string,
    @Query('payload') payloadRaw: string,
    @Res() res: Response,
  ) {
    const frontUrl = process.env.FRONTEND_URL ?? '';

    if (error) {
      return res.redirect(`${frontUrl}/login?error=vk_denied`);
    }

    let code = codeRaw;
    let state = stateRaw;
    let deviceId = deviceIdRaw;

    if (payloadRaw) {
      try {
        const payload = JSON.parse(payloadRaw) as {
          code?: string;
          state?: string;
          device_id?: string;
        };
        code = payload.code ?? code;
        state = payload.state ?? state;
        deviceId = payload.device_id ?? deviceId;
      } catch {
        // ignore malformed payload
      }
    }

    const pending = state ? pendingAuth.get(state) : undefined;
    pendingAuth.delete(state);

    if (!code || !state || !pending) {
      return res.redirect(`${frontUrl}/login?error=invalid_state`);
    }

    try {
      const { accessToken, refreshToken } =
        await this.authService.handleVkCallback({
          code,
          codeVerifier: pending.codeVerifier,
          deviceId,
          state,
        });

      setAuthCookies(res, accessToken, refreshToken);

      return res.redirect(`${frontUrl}${pending.next}`);
    } catch {
      return res.redirect(`${frontUrl}/login?error=vk_auth_failed`);
    }
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/api/v1/auth' });
    return { message: 'Logged out' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: AuthUser) {
    return this.authService.getFreshUserProfile(user.sub ?? user.id);
  }

  @Get('public-stats')
  getPublicStats() {
    return this.authService.getPublicStats();
  }

  @Post('vk/sdk-exchange')
  async vkSdkExchange(
    @Body()
    body: {
      code?: string;
      state?: string;
      deviceId?: string;
      codeVerifier?: string;
      accessToken?: string;
      next?: string;
    },
    @Res({ passthrough: true }) res: Response,
  ) {
    let tokens: { accessToken: string; refreshToken: string };

    if (body.accessToken) {
      tokens = await this.authService.handleVkAccessToken(body.accessToken);
    } else if (body.code) {
      tokens = await this.authService.handleVkCallback({
        code: body.code,
        state: body.state,
        deviceId: body.deviceId,
        codeVerifier: body.codeVerifier,
      });
    } else {
      throw new UnauthorizedException('Missing code or accessToken');
    }

    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    return {
      ok: true,
      next: body.next && body.next.startsWith('/') ? body.next : '/map',
    };
  }

  @Post('refresh')
  async refresh(@Res() res: Response) {
    const cookies = res.req.cookies as Record<string, string> | undefined;
    const token = cookies?.refresh_token;
    if (!token) throw new UnauthorizedException();
    const { accessToken, refreshToken } = this.authService.refreshTokens(token);
    setAuthCookies(res, accessToken, refreshToken);
    return res.json({ ok: true });
  }

  @Post('admin-login')
  @HttpCode(200)
  async adminLogin(
    @Body() body: { login: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const ip =
      (res.req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      res.req.socket.remoteAddress ||
      'unknown';

    if (adminBannedIps.has(ip)) {
      throw new UnauthorizedException('Access denied');
    }

    try {
      const result = await this.authService.adminLogin(
        body.login,
        body.password,
      );
      adminLoginFails.delete(ip);
      setAuthCookies(res, result.accessToken, result.refreshToken);
      return { ok: true };
    } catch {
      const n = (adminLoginFails.get(ip) ?? 0) + 1;
      adminLoginFails.set(ip, n);
      if (n >= 2) {
        adminBannedIps.add(ip);
        adminLoginFails.delete(ip);
      }
      throw new UnauthorizedException('Invalid credentials');
    }
  }
}
