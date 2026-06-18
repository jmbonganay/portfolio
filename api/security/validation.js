export const MAX_BODY_BYTES = 12_000;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f]/;
const ALLOWED_SUBMISSION_TYPES = new Set(["ai_scoper", "contact_form"]);
const ALLOWED_FIELDS = new Set([
  "botcheck",
  "captchaToken",
  "email",
  "message",
  "name",
  "projectIdea",
  "projectType",
  "submissionType",
]);

export function parsePayload(body) {
  if (!body) {
    return null;
  }

  if (typeof body !== "string") {
    return body;
  }

  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
}

export function getBodyByteLength(body) {
  if (!body) {
    return 0;
  }

  try {
    const value = typeof body === "string" ? body : JSON.stringify(body);
    return Buffer.byteLength(value, "utf8");
  } catch {
    return MAX_BODY_BYTES + 1;
  }
}

function readString(payload, field, { max, min = 0, required = false } = {}) {
  const value = payload[field];

  if (value === undefined || value === null) {
    return required ? null : "";
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  if ((required && !normalized) || normalized.length < min || normalized.length > max) {
    return null;
  }

  return normalized;
}

export function validatePayload(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { ok: false, status: 400 };
  }

  if (Object.keys(payload).some((field) => !ALLOWED_FIELDS.has(field))) {
    return { ok: false, status: 400 };
  }

  const botcheck = readString(payload, "botcheck", { max: 20 });
  if (botcheck === null) {
    return { ok: false, status: 400 };
  }
  if (botcheck) {
    return { ok: false, honeypot: true, status: 202 };
  }

  const submissionType = readString(payload, "submissionType", {
    max: 80,
    required: true,
  });
  if (!ALLOWED_SUBMISSION_TYPES.has(submissionType)) {
    return { ok: false, status: 400 };
  }

  const name = readString(payload, "name", { max: 160, required: true });
  const email = readString(payload, "email", { max: 240, required: true });
  const captchaToken = readString(payload, "captchaToken", { max: 4096, required: true });
  const projectIdea = readString(payload, "projectIdea", {
    max: 3000,
    min: 20,
    required: true,
  });
  const message = readString(payload, "message", {
    max: 3000,
    min: submissionType === "contact_form" ? 20 : 0,
    required: submissionType === "contact_form",
  });
  const projectType = readString(payload, "projectType", {
    max: 160,
    required: submissionType === "contact_form",
  });

  if (
    name === null ||
    email === null ||
    captchaToken === null ||
    projectIdea === null ||
    message === null ||
    projectType === null ||
    CONTROL_CHARACTER_PATTERN.test(name) ||
    CONTROL_CHARACTER_PATTERN.test(email) ||
    CONTROL_CHARACTER_PATTERN.test(projectType) ||
    !EMAIL_PATTERN.test(email)
  ) {
    return { ok: false, status: 400 };
  }

  return {
    ok: true,
    payload: {
      captchaToken,
      email: email.toLowerCase(),
      message: message || projectIdea,
      name,
      projectIdea,
      projectType: projectType || "Not selected",
      submissionType,
    },
  };
}
