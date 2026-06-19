const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const URL_PATTERN = /https?:\/\/[^\s)\]}]+/gi;
const SENSITIVE_KEY_PATTERN =
  /(?:authorization|cookie|password|secret|token|api[_-]?key|captcha|email|message|payload|projectidea|^request$|request[_-]?body|response[_-]?body|webhook|client[_-]?ip|user[_-]?agent)/i;

export function stripUrlDetails(value) {
  if (typeof value !== "string") return value;

  try {
    if (value.startsWith("/")) {
      const url = new URL(value, "https://portfolio.invalid");
      return url.pathname;
    }

    if (/^https?:\/\//i.test(value)) {
      const url = new URL(value);
      return `${url.origin}${url.pathname}`;
    }
  } catch {
    return "[redacted-url]";
  }

  return value;
}

function sanitizeString(value) {
  return value
    .replace(EMAIL_PATTERN, "[redacted-email]")
    .replace(URL_PATTERN, (url) => stripUrlDetails(url));
}

function sanitizeValue(value, seen = new WeakSet()) {
  if (typeof value === "string") return sanitizeString(value);
  if (!value || typeof value !== "object") return value;
  if (seen.has(value)) return "[circular]";

  seen.add(value);

  if (Array.isArray(value)) {
    return value.map((entry) => sanitizeValue(entry, seen));
  }

  const sanitized = {};
  for (const [key, entry] of Object.entries(value)) {
    if (SENSITIVE_KEY_PATTERN.test(key)) continue;
    sanitized[key] = sanitizeValue(entry, seen);
  }
  return sanitized;
}

function sanitizeStacktrace(stacktrace) {
  if (!stacktrace?.frames) return stacktrace;

  return {
    ...stacktrace,
    frames: stacktrace.frames.map((frame) => ({
      ...frame,
      ...(frame.filename
        ? { filename: stripUrlDetails(frame.filename) }
        : {}),
      ...(frame.abs_path
        ? { abs_path: stripUrlDetails(frame.abs_path) }
        : {}),
    })),
  };
}

export function sanitizeSentryBreadcrumb(breadcrumb) {
  if (!breadcrumb || typeof breadcrumb !== "object") return breadcrumb;
  if (
    breadcrumb.category === "console" ||
    breadcrumb.category === "ui.input"
  ) {
    return null;
  }

  const sanitized = { ...breadcrumb };
  if (typeof sanitized.message === "string") {
    sanitized.message = sanitizeString(sanitized.message);
  }
  if (sanitized.data) {
    sanitized.data = sanitizeValue(sanitized.data);
    for (const key of ["from", "to", "url"]) {
      if (typeof sanitized.data[key] === "string") {
        sanitized.data[key] = stripUrlDetails(sanitized.data[key]);
      }
    }
  }
  return sanitized;
}

export function sanitizeSentryEvent(event) {
  if (!event || typeof event !== "object") return event;

  const sanitized = { ...event };
  delete sanitized.user;

  if (typeof sanitized.message === "string") {
    sanitized.message = sanitizeString(sanitized.message);
  }

  if (sanitized.request) {
    sanitized.request = sanitized.request.url
      ? { url: stripUrlDetails(sanitized.request.url) }
      : undefined;
  }

  if (sanitized.extra) sanitized.extra = sanitizeValue(sanitized.extra);
  if (sanitized.contexts) sanitized.contexts = sanitizeValue(sanitized.contexts);
  if (sanitized.tags) sanitized.tags = sanitizeValue(sanitized.tags);

  if (sanitized.exception?.values) {
    sanitized.exception = {
      ...sanitized.exception,
      values: sanitized.exception.values.map((exception) => ({
        ...exception,
        ...(typeof exception.value === "string"
          ? { value: sanitizeString(exception.value) }
          : {}),
        ...(exception.stacktrace
          ? { stacktrace: sanitizeStacktrace(exception.stacktrace) }
          : {}),
      })),
    };
  }

  if (sanitized.breadcrumbs) {
    sanitized.breadcrumbs = sanitized.breadcrumbs
      .map(sanitizeSentryBreadcrumb)
      .filter(Boolean);
  }

  return sanitized;
}
