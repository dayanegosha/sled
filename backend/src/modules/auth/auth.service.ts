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
};

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly db: DbService,
  ) {}

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
         DO UPDATE SET username = EXCLUDED.username,
                       display_name = EXCLUDED.display_name,
                       avatar_url = EXCLUDED.avatar_url,
                       updated_at = NOW()
         RETURNING id, vk_id, username, display_name, avatar_url, is_admin`,
        [userProfile.id, username, displayName, userProfile.avatar ?? null],
      );

      if (rows[0]) {
        localUser = rows[0];
      }
    } catch {
      // DB may be unavailable in local mode; keep in-memory user payload.
    }

    const accessToken = this.jwt.sign(
      {
        sub: localUser.id,
        id: localUser.id,
        vk_id: localUser.vk_id,
        username: localUser.username,
        display_name: localUser.display_name,
        avatar_url: localUser.avatar_url,
        is_admin: localUser.is_admin,
      },
      {
        secret: this.config.get<string>('JWT_SECRET'),
        expiresIn: '15m',
      },
    );

    const refreshToken = this.jwt.sign(
      { sub: localUser.id, type: 'refresh' },
      {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '30d',
      },
    );

    return { accessToken, refreshToken, user: localUser };
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
      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code: params.code,
        code_verifier: params.codeVerifier,
        client_id: clientId,
        device_id: params.deviceId,
        redirect_uri: redirectUri,
        state: params.state ?? '',
      });

      const tokenRes = await axios.post<VkTokenResponse>(
        'https://id.vk.ru/oauth2/auth',
        body.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
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
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
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
    const payload = this.jwt.verify<{ sub: string }>(refreshToken, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
    });

    const accessToken = this.jwt.sign(
      { sub: payload.sub, is_admin: false },
      {
        secret: this.config.get<string>('JWT_SECRET'),
        expiresIn: '15m',
      },
    );
    return { accessToken };
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
