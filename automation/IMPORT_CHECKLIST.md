# Hardened Make Blueprint Import Checklist

Import `asynchronous-inbound-crm-triage-engine.hardened.blueprint.json` as a new
scenario. Keep the existing scenario disabled until every item below is checked.

## Connections and resources

- Open module 1 and select the secured Custom Webhook that has API key
  authentication enabled. The Vercel `MAKE_WEBHOOK_URL` must point to this
  webhook, and `MAKE_WEBHOOK_SECRET` must match one of its API keys.
- Reconnect Google Sheets in modules 12, 13, and 14. Confirm the destination
  spreadsheet and column mappings before saving each module. The former company
  enrichment columns intentionally remain `Not collected` or blank.
- Reconnect Gmail in modules 9, 10, 11, 23, 24, 25, and 26. Confirm modules
  9, 10, 11, and 23 send only to `{{1.email}}`; modules 24, 25, and 26 must
  retain the fixed owner recipient.
- Reconnect Gemini in module 17 and keep the model set to Gemini 2.5 Flash.
- Reconnect Google Docs in module 19. Re-select the approved proposal template
  and destination folder if Make cannot restore them during import.
- Reconnect Google Drive in module 22 and confirm Google Docs files are exported
  as `application/pdf`.

## Route and output checks

- Use **Run once** and submit a recruiter-style contact message. Confirm only the
  recruiter Sheet row, one owner notice, and one visitor acknowledgment run.
- Repeat with a project-style contact message. Confirm only the project route runs.
- Repeat with a general contact message. Confirm only the general route runs.
- Submit the AI scoper form. Confirm only the AI route runs and the attached PDF
  originates from module 22.
- Test an AI concept containing phrases such as "ignore previous instructions".
  Confirm the output still contains exactly the four required scope sections.
- Verify failed executions do not expose webhook API keys or user message contents
  in notifications shared outside the Make team.
- Confirm the imported scenario has no AbstractAPI enrichment request. The hardened
  workflow does not send visitor email domains to an additional provider.

## Activation

- Confirm the portfolio gateway receives `202` from the new scenario in both local
  development and Vercel Preview.
- Disable the previous scenario, enable the hardened scenario, and repeat one
  contact and one AI scoper submission in Production.
- Keep webhook API keys only in Make, Vercel environment variables, and local
  `.env.local`. Never place them in this blueprint or commit them to Git.
