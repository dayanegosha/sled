/**
 * Shape of the decoded JWT payload attached to `req.user` by `JwtAuthGuard`
 * and exposed through the `@CurrentUser()` decorator.
 *
 * `sub` and `id` are always present; the remaining profile claims are present
 * on access tokens minted from a full user record and may be absent on tokens
 * issued by the refresh flow.
 */
export interface AuthUser {
  /** User id — JWT `sub` claim. */
  sub: string;
  /** User id — duplicated as `id` for convenience. */
  id: string;
  vk_id?: number;
  username?: string;
  display_name?: string;
  avatar_url?: string | null;
  is_admin?: boolean;
  needs_username?: boolean;
}
