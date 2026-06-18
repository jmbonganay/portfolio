export const contactCopy = {
  eyebrow: "Start a conversation",
  headline: "Tell me what you need to launch.",
  introduction:
    "A short overview of the goal, platform, and timeline is enough. I will review it personally and reply with the clearest next step.",
  formEyebrow: "Project inquiry",
  formTitle: "Send the project details",
  formHelper: "Required fields only. No long questionnaire.",
  messageLabel: "Project details",
  messageHint: "Share the goal, platform, timeline, or anything useful.",
  submitLabel: "Send project details",
  fallback: "Security check unavailable? Email me directly instead.",
};

export const contactProjectTypes = [
  "Landing page",
  "Website or store",
  "Automation",
  "Remote role",
];

export const contactTrustSignals = [
  "Usually replies within 24 hours",
  "Design, build, QA, and handoff support",
  "Remote ready with US, UK, and AU overlap",
];

export function getFirstInvalidContactField(errors) {
  return ["name", "email", "message"].find((field) => errors[field]) ?? null;
}
