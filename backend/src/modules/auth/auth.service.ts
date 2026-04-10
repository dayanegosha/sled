import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import { DbService } from '../../database/db.service';

type VkTokenResponse = {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in?: number;
  user_id?: number;
  state?: string;
  scope?: string;
};

type VkIdUserResponse = {
  user: {
    user_id: string;
    first_name: string;
    last_name: string;
    avatar?: string;
    email?: string;
  };
};

type LegacyVkUser = {
  id: number;
  first_name: string;
  last_name: string;
  screen_name?: string;
  photo_200?: string;
};

type LocalUser = {
  id: string;
  vk_id: number;
  username: string;
  display_name: string;
  avatar_url: string | null;
  is_admin: boolean;
  bio?: string;
};

function needsUsername(username: string): boolean {
  return /^(vkid_|id)\d+$/.test(username);
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly db: DbService,
  ) {}

  private buildJwtPayload(user: LocalUser) {
    return {
      sub: user.id,
      id: user.id,
      vk_id: user.vk_id,
      username: user.username,
      display_name: user.display_name,
      avatar_url: user.avatar_url,
      is_admin: user.is_admin,
      needs_username: needsUsername(user.username),
    };
  }

  private signTokens(user: LocalUser) {
    const accessToken = this.jwt.sign(this.buildJwtPayload(user), {
      secret: this.config.get<string>('JWT_SECRET'),
      expiresIn: '15m',
    });

    const refreshToken = this.jwt.sign(
      { sub: user.id, type: 'refresh' },
      {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '30d',
      },
    );

    return { accessToken, refreshToken, user };
  }

  async getFreshUserProfile(userId: string) {
    try {
      const { rows } = await this.db.query<LocalUser & { bio?: string | null }>(
        `SELECT id, vk_id, username, display_name, avatar_url, is_admin, bio
         FROM users WHERE id = $1`,
        [userId],
      );
      const row = rows[0];
      if (!row) {
        return { id: userId, needs_username: true };
      }
      return {
        id: row.id,
        vk_id: row.vk_id,
        username: row.username,
        display_name: row.display_name,
        avatar_url: row.avatar_url,
        is_admin: row.is_admin,
        bio: row.bio ?? null,
        needs_username: needsUsername(row.username),
      };
    } catch {
      return { id: userId, needs_username: true };
    }
  }

  async handleVkAccessToken(vkAccessToken: string) {
    if (!vkAccessToken) throw new UnauthorizedException('Missing access token');

    const clientId = this.config.get<string>('VK_APP_ID') ?? '';

    const userBody = new URLSearchParams({
      access_token: vkAccessToken,
      client_id: clientId,
    });

    let userProfile: {
      id: number;
      firstName: string;
      lastName: string;
      username?: string;
      avatar?: string;
    };

    try {
      const userRes = await axios.post<VkIdUserResponse>(
        'https://id.vk.ru/oauth2/user_info',
        userBody.toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );

      const user = userRes.data.user;
      if (!user) throw new Error('No user in response');

      const id = Number(user.user_id);
      if (!Number.isFinite(id)) throw new Error('Invalid user_id');

      userProfile = {
        id,
        firstName: user.first_name,
        lastName: user.last_name,
        username: `vkid_${id}`,
        avatar: user.avatar,
      };
    } catch {
      throw new UnauthorizedException('VK token validation failed');
    }

    const displayName =
      `${userProfile.firstName} ${userProfile.lastName}`.trim();
    const username = userProfile.username || `id${userProfile.id}`;

    let localUser: LocalUser = {
      id: crypto.randomUUID(),
      vk_id: userProfile.id,
      username,
      display_name: displayName,
      avatar_url: userProfile.avatar ?? null,
      is_admin: false,
    };

    try {
      const { rows } = await this.db.query<LocalUser>(
        `INSERT INTO users (vk_id, username, display_name, avatar_url)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (vk_id)
         DO UPDATE SET display_name = EXCLUDED.display_name,
                       updated_at = NOW()
         RETURNING id, vk_id, username, display_name, avatar_url, is_admin`,
        [userProfile.id, username, displayName, userProfile.avatar ?? null],
      );

      if (rows[0]) {
        localUser = rows[0];
      }
    } catch {
      // DB may be unavailable
    }

    return this.signTokens(localUser);
  }

  async handleVkCallback(params: {
    code: string;
    codeVerifier?: string;
    deviceId?: string;
    state?: string;
  }) {
    if (!params.code) throw new UnauthorizedException('Missing VK code');

    const mode = this.config.get<string>('VK_AUTH_MODE') ?? 'vkid';

    let userProfile: {
      id: number;
      firstName: string;
      lastName: string;
      username?: string;
      avatar?: string;
    } | null = null;

    if (mode !== 'legacy') {
      userProfile = await this.tryVkIdFlow(params);
    }

    if (!userProfile) {
      userProfile = await this.tryLegacyFlow(params.code);
    }

    if (!userProfile) {
      throw new UnauthorizedException('VK user fetch failed');
    }

    const displayName =
      `${userProfile.firstName} ${userProfile.lastName}`.trim();
    const username = userProfile.username || `id${userProfile.id}`;

    let localUser: LocalUser = {
      id: crypto.randomUUID(),
      vk_id: userProfile.id,
      username,
      display_name: displayName,
      avatar_url: userProfile.avatar ?? null,
      is_admin: false,
    };

    try {
      const { rows } = await this.db.query<LocalUser>(
        `INSERT INTO users (vk_id, username, display_name, avatar_url)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (vk_id)
         DO UPDATE SET display_name = EXCLUDED.display_name,
                       updated_at = NOW()
         RETURNING id, vk_id, username, display_name, avatar_url, is_admin`,
        [userProfile.id, username, displayName, userProfile.avatar ?? null],
      );

      if (rows[0]) {
        localUser = rows[0];
      }
    } catch {
      // DB may be unavailable in local mode
    }

    return this.signTokens(localUser);
  }

  private async tryVkIdFlow(params: {
    code: string;
    codeVerifier?: string;
    deviceId?: string;
    state?: string;
  }) {
    const clientId = this.config.get<string>('VK_APP_ID') ?? '';
    const redirectUri = this.config.get<string>('VK_CALLBACK_URL') ?? '';

    if (!clientId || !redirectUri || !params.codeVerifier || !params.deviceId) {
      return null;
    }

    try {
      const bodyParams: Record<string, string> = {
        grant_type: 'authorization_code',
        code: params.code,
        code_verifier: params.codeVerifier,
        client_id: clientId,
        device_id: params.deviceId,
        redirect_uri: redirectUri,
      };
      if (params.state) bodyParams.state = params.state;
      const body = new URLSearchParams(bodyParams);

      const tokenRes = await axios.post<VkTokenResponse>(
        'https://id.vk.ru/oauth2/auth',
        body.toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );

      const accessToken = tokenRes.data.access_token;
      if (!accessToken) return null;

      const userBody = new URLSearchParams({
        access_token: accessToken,
        client_id: clientId,
      });

      const userRes = await axios.post<VkIdUserResponse>(
        'https://id.vk.ru/oauth2/user_info',
        userBody.toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );

      const user = userRes.data.user;
      if (!user) return null;

      const id = Number(user.user_id);
      if (!Number.isFinite(id)) return null;

      return {
        id,
        firstName: user.first_name,
        lastName: user.last_name,
        username: `vkid_${id}`,
        avatar: user.avatar,
      };
    } catch {
      return null;
    }
  }

  private async tryLegacyFlow(code: string) {
    const appId = this.config.get<string>('VK_APP_ID') ?? '';
    const secret = this.config.get<string>('VK_APP_SECRET') ?? '';
    const redirectUri = this.config.get<string>('VK_CALLBACK_URL') ?? '';

    if (!appId || !secret || !redirectUri) {
      return null;
    }

    try {
      const tokenRes = await axios.get<{
        access_token: string;
        user_id: number;
      }>('https://oauth.vk.com/access_token', {
        params: {
          client_id: appId,
          client_secret: secret,
          redirect_uri: redirectUri,
          code,
        },
      });

      const accessToken = tokenRes.data.access_token;
      const userRes = await axios.get<{ response: LegacyVkUser[] }>(
        'https://api.vk.com/method/users.get',
        {
          params: {
            user_ids: tokenRes.data.user_id,
            fields: 'screen_name,photo_200',
            access_token: accessToken,
            v: '5.199',
          },
        },
      );

      const user = userRes.data.response?.[0];
      if (!user) return null;

      return {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        username: user.screen_name,
        avatar: user.photo_200,
      };
    } catch {
      return null;
    }
  }

  refreshTokens(refreshToken: string) {
    let payload: { sub: string };
    try {
      payload = this.jwt.verify<{ sub: string }>(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const userId = payload.sub;

    const accessToken = this.jwt.sign(
      { sub: userId, id: userId },
      {
        secret: this.config.get<string>('JWT_SECRET'),
        expiresIn: '15m',
      },
    );

    const newRefreshToken = this.jwt.sign(
      { sub: userId, type: 'refresh' },
      {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '30d',
      },
    );

    return { accessToken, refreshToken: newRefreshToken };
  }

  async refreshTokensWithUser(refreshTokenStr: string) {
    let payload: { sub: string };
    try {
      payload = this.jwt.verify<{ sub: string }>(refreshTokenStr, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    try {
      const { rows } = await this.db.query<LocalUser>(
        `SELECT id, vk_id, username, display_name, avatar_url, is_admin
         FROM users WHERE id = $1`,
        [payload.sub],
      );
      if (rows[0]) {
        return this.signTokens(rows[0]);
      }
    } catch {
      // DB unavailable - fall back to minimal token
    }

    return this.refreshTokens(refreshTokenStr);
  }

  async adminLogin(login: string, password: string) {
    const expectedLogin = this.config.get<string>('ADMIN_LOGIN') ?? 'admin';
    const expectedPassword = this.config.get<string>('ADMIN_PASSWORD');
    if (!expectedPassword) {
      throw new UnauthorizedException('Admin auth not configured');
    }
    if (login !== expectedLogin || password !== expectedPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    let adminUser: LocalUser | null = null;
    try {
      const { rows } = await this.db.query<LocalUser>(
        `SELECT id, vk_id, username, display_name, avatar_url, is_admin
         FROM users WHERE is_admin = true LIMIT 1`,
      );
      adminUser = rows[0] ?? null;
    } catch {
      // DB might be unavailable
    }

    if (!adminUser) {
      const accessToken = this.jwt.sign(
        { sub: 'admin', id: 'admin', is_admin: true, username: 'admin', display_name: 'Admin' },
        { secret: this.config.get<string>('JWT_SECRET'), expiresIn: '2h' },
      );
      const refreshToken = this.jwt.sign(
        { sub: 'admin', type: 'refresh' },
        { secret: this.config.get<string>('JWT_REFRESH_SECRET'), expiresIn: '7d' },
      );
      return { accessToken, refreshToken };
    }

    return this.signTokens(adminUser);
  }

  async getPublicStats() {
    try {
      const [usersRes, distanceRes, regionsRes] = await Promise.all([
        this.db.query<{ total: string }>(
          'SELECT COUNT(*)::text AS total FROM users',
        ),
        this.db.query<{ total_km: string }>(
          'SELECT COALESCE(SUM(total_distance), 0) / 1000.0 AS total_km FROM users',
        ),
        this.db.query<{ total: string }>(
          'SELECT COUNT(*)::text AS total FROM regions',
        ),
      ]);

      return {
        explorers: Number(usersRes.rows[0]?.total ?? 0),
        totalKm: Math.round(Number(distanceRes.rows[0]?.total_km ?? 0)),
        regions: Number(regionsRes.rows[0]?.total ?? 0),
      };
    } catch {
      return {
        explorers: 0,
        totalKm: 0,
        regions: 0,
      };
    }
  }
}
