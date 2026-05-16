/**
 * Admin + public resend helpers for registration invites.
 * Paths are scoped under `/admin/api/…` via `absoluteScopedUrl` (admin face prefix).
 */
import { getApiErrorMessage } from '../../utils/apiErrorMessage';
import { absoluteScopedUrl } from '../faceApiRouting';

export interface RegistrationInviteRow {
  id: string;
  email: string;
  /** Lowercase: `pending` | `completed` | `expired` | `revoked`. */
  status: string;
  createdAtUtc: string;
  expiresAtUtc: string;
  consumedAtUtc: string | null;
}

async function authFetch(path: string, token: string, init?: RequestInit) {
  return fetch(absoluteScopedUrl(path), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init?.headers as Record<string, string>),
    },
  });
}

export async function listRegistrationInvites(
  token: string,
  skip = 0,
  take = 50
): Promise<RegistrationInviteRow[]> {
  const res = await authFetch(
    `/api/admin/registration-invites?skip=${skip}&take=${take}`,
    token
  );
  if (!res.ok) {
    throw new Error(await getApiErrorMessage(res, 'Failed to load registration invites'));
  }
  return (await res.json()) as RegistrationInviteRow[];
}

/** Creates invite and sends the same mail template as public `register/request`. */
export async function createRegistrationInvite(
  token: string,
  body: { email: string; firstName?: string; lastName?: string; locale?: string }
): Promise<RegistrationInviteRow> {
  const res = await authFetch('/api/admin/registration-invites', token, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(await getApiErrorMessage(res, 'Failed to create invite'));
  }
  return (await res.json()) as RegistrationInviteRow;
}

/** Uses public resend endpoint (rotates hash+code); requires super-admin token for admin UI only. */
export async function resendRegistrationInviteEmail(
  token: string,
  email: string,
  locale = 'en'
): Promise<void> {
  const res = await authFetch('/api/oauth2/register/resend', token, {
    method: 'POST',
    body: JSON.stringify({ email, locale }),
  });
  if (!res.ok) {
    throw new Error(await getApiErrorMessage(res, 'Failed to resend invite email'));
  }
}

export async function revokeRegistrationInvite(token: string, id: string): Promise<void> {
  const res = await authFetch(`/api/admin/registration-invites/${id}/revoke`, token, {
    method: 'POST',
  });
  if (!res.ok) {
    throw new Error(await getApiErrorMessage(res, 'Failed to revoke invite'));
  }
}
