const DEV_CRON_SECRET = "dev_secret_key_123";

export function getExpectedCronSecret(): string | null {
  const configured = process.env.CRON_SECRET?.trim();
  if (configured) return configured;

  return process.env.NODE_ENV === "production" ? null : DEV_CRON_SECRET;
}

export function getProvidedCronSecret(request: Request): string | null {
  const { searchParams } = new URL(request.url);
  const secretParam = searchParams.get("secret")?.trim();
  const authHeader = request.headers.get("authorization");
  const secretHeader = authHeader?.startsWith("Bearer ")
    ? authHeader.substring("Bearer ".length).trim()
    : null;

  return secretParam || secretHeader || null;
}

export function isAuthorizedCronRequest(request: Request): boolean {
  const expectedSecret = getExpectedCronSecret();
  const providedSecret = getProvidedCronSecret(request);

  return Boolean(expectedSecret && providedSecret && providedSecret === expectedSecret);
}
