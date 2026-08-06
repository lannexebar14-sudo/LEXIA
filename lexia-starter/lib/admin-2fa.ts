const COOKIE_NAME = "lexia_admin_2fa";
const TOKEN_TTL_SECONDS = 60 * 60 * 8;

function secret() {
  return process.env.ADMIN_2FA_SECRET || process.env.ADMIN_2FA_CODE || "lexia-admin-2fa-180319";
}

function expectedCode() {
  return process.env.ADMIN_2FA_CODE || "180319";
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

async function hmac(value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return bytesToBase64Url(new Uint8Array(signature));
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let index = 0; index < a.length; index += 1) result |= a.charCodeAt(index) ^ b.charCodeAt(index);
  return result === 0;
}

export function getAdmin2FACookieName() {
  return COOKIE_NAME;
}

export function getAdmin2FATtlSeconds() {
  return TOKEN_TTL_SECONDS;
}

export function isExpectedAdminCode(code: string) {
  return safeEqual(code.trim(), expectedCode());
}

export async function createAdmin2FAToken(userId: string, accessToken: string) {
  const expiresAt = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
  const sessionFingerprint = await hmac(accessToken);
  const payload = `${userId}.${expiresAt}.${sessionFingerprint}`;
  const signature = await hmac(payload);
  return `${payload}.${signature}`;
}

export async function verifyAdmin2FAToken(token: string | undefined, userId: string, accessToken: string) {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 4) return false;
  const [tokenUserId, expiresAtRaw, tokenFingerprint, signature] = parts;
  const expiresAt = Number(expiresAtRaw);
  if (tokenUserId !== userId || !Number.isFinite(expiresAt) || expiresAt < Math.floor(Date.now() / 1000)) return false;
  const expectedFingerprint = await hmac(accessToken);
  if (!safeEqual(tokenFingerprint, expectedFingerprint)) return false;
  const expectedSignature = await hmac(`${tokenUserId}.${expiresAtRaw}.${tokenFingerprint}`);
  return safeEqual(signature, expectedSignature);
}
