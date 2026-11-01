export const ALLOWED_DEVELOPER_EMAILS = [
  'yousufadilelhag77@gmail.com',
  'insung.hw@outlook.com',
] as const;

export const DEVELOPER_PASSWORD = ':9sC_YRgQ4whJZa';

/**
 * Returns true if the provided email matches one of the two authorized developer accounts.
 * Case-insensitive and trimmed.
 */
export function isAllowedDeveloperEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return ALLOWED_DEVELOPER_EMAILS.some((allowed) => allowed.toLowerCase() === normalized);
}

/**
 * Validates the developer credentials against authorized accounts.
 * Only yousufadilelhag77@gmail.com and insung.hw@outlook.com with the exact password can log in.
 */
export function verifyDeveloperCredentials(email: string, pass: string): boolean {
  return isAllowedDeveloperEmail(email) && pass === DEVELOPER_PASSWORD;
}
