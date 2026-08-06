import crypto from "node:crypto";

const COOKIE_NAME = "lexia_admin_2fa";

function getSecret() {
  return (
    process.env.ADMIN_2FA_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.ADMIN_2FA_CODE ||
    "lexia-admin-session"
  );
}

export function getAdmin2FACookieName() {
  return COOKIE_NAME;
}

export function getExpectedAdminCode() {
  return process.env.ADMIN_2FA_CODE || "180319";
}

export function createAdmin2FAToken(userId: string) {
  return crypto.createHmac("sha256", getSecret()).update(`lexia-admin:${userId}`).digest("hex");
}

export function verifyAdmin2FAToken(userId: string, token?: string) {
  if (!token) return false;
  const expected = createAdmin2FAToken(userId);
  const received = Buffer.from(token);
  const reference = Buffer.from(expected);
  return received.length === reference.length && crypto.timingSafeEqual(received, reference);
}
