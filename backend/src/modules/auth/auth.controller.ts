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
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

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

  @Get('vk/callback')
  async vkCallback(
    @Query('code') codeRaw: string,
    @Query('error') error: string,
    @Query('state') stateRaw: string,
    @Query('device_id') deviceIdRaw: string,
    @Query('payload') payloadRaw: string,
    @Res() res: Response,
  ) {
    if (error) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=vk_denied`);
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
        // ignore malformed payload and use direct query params
      }
    }

    const expectedState = res.req.cookies?.vk_state;
    const codeVerifier = res.req.cookies?.vk_code_verifier;
    const next = res.req.cookies?.vk_next;

    res.clearCookie('vk_state', { path: '/api/v1/auth/vk/callback' });
    res.clearCookie('vk_code_verifier', { path: '/api/v1/auth/vk/callback' });
    res.clearCookie('vk_next', { path: '/api/v1/auth/vk/callback' });

    if (!code || !state || !expectedState || state !== expectedState) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=invalid_state`,
      );
    }

    const { accessToken, refreshToken } =
      await this.authService.handleVkCallback({
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

  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return { message: 'Logged out' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: any) {
    return user;
  }

  @Get('public-stats')
  getPublicStats() {
    return this.authService.getPublicStats();
  }

  @Post('vk/sdk-exchange')
  async vkSdkExchange(
    @Body()
    body: {
      code: string;
      state?: string;
      deviceId?: string;
      codeVerifier?: string;
      next?: string;
    },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.handleVkCallback({
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

  @Post('refresh')
  async refresh(@Res() res: Response) {
    const token = res.req.cookies?.refresh_token;
    if (!token) throw new UnauthorizedException();
    const { accessToken } = this.authService.refreshTokens(token);
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    });
    return res.json({ ok: true });
  }
}
