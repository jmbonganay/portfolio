function parsePayload(body) {
  if (!body) {
    return {};
  }

  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }

  return body;
}

function isSameOriginRequest(request) {
  const origin = request.headers.origin;
  const host = request.headers.host;

  if (!origin || !host) {
    return true;
  }

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function cleanText(value, maxLength = 1200) {
  return String(value ?? "").trim().slice(0, maxLength);
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  if (!isSameOriginRequest(request)) {
    return response.status(403).json({ error: "Forbidden" });
  }

  const webhookUrl = process.env.MAKE_WEBHOOK_URL;

  if (!webhookUrl) {
    return response.status(503).json({ error: "Automation endpoint is not configured" });
  }

  const payload = parsePayload(request.body);
  const forwardedPayload = {
    name: cleanText(payload.name, 160),
    email: cleanText(payload.email, 240),
    message: cleanText(payload.message ?? payload.projectIdea, 3000),
    projectIdea: cleanText(payload.projectIdea ?? payload.message, 3000),
    projectType: cleanText(payload.projectType || "Not selected", 160),
    submissionType: cleanText(payload.submissionType || "ai_scoper", 80),
    forwardedAt: new Date().toISOString(),
  };

  const makeResponse = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Portfolio-Source": "vercel-api",
      ...(process.env.MAKE_WEBHOOK_SECRET
        ? { "X-Portfolio-Secret": process.env.MAKE_WEBHOOK_SECRET }
        : {}),
    },
    body: JSON.stringify(forwardedPayload),
  });

  if (!makeResponse.ok) {
    return response.status(502).json({ error: "Automation handoff failed" });
  }

  return response.status(202).json({ ok: true });
}
