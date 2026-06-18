const HCAPTCHA_VERIFY_URL = "https://api.hcaptcha.com/siteverify";

export async function verifyHCaptcha({
  token,
  remoteIp,
  secret = process.env.HCAPTCHA_SECRET_KEY,
  siteKey = process.env.VITE_HCAPTCHA_SITE_KEY,
  fetchImpl = fetch,
  timeoutMs = 5_000,
}) {
  if (!token || !secret || !siteKey) {
    return { success: false, reason: "configuration" };
  }

  const body = new URLSearchParams({
    remoteip: remoteIp || "",
    response: token,
    secret,
    sitekey: siteKey,
  });
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(HCAPTCHA_VERIFY_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    if (!response.ok) {
      return { success: false, reason: "provider" };
    }

    const result = await response.json();
    return result?.success
      ? { success: true }
      : { success: false, reason: "challenge" };
  } catch {
    return { success: false, reason: "provider" };
  } finally {
    clearTimeout(timeoutId);
  }
}
