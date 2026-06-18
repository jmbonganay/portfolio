import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import {
  transformBlueprint,
  validateBlueprint,
} from "../scripts/harden-make-blueprint.mjs";

const sourcePath =
  "/Users/johnmichaelbonganay/Downloads/Asynchronous Inbound CRM Triage Engine.blueprint.json";
const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));

function findModule(blueprint, id) {
  const pending = [blueprint];

  while (pending.length > 0) {
    const value = pending.pop();
    if (value?.id === id && value.module) return value;
    if (Array.isArray(value)) pending.push(...value);
    else if (value && typeof value === "object") {
      pending.push(...Object.values(value));
    }
  }

  return null;
}

function filterText(module) {
  return JSON.stringify(module.filter ?? {}).toLowerCase();
}

test("expands the secured webhook schema without embedding credentials", () => {
  const blueprint = transformBlueprint(source);
  const webhook = findModule(blueprint, 1);
  const fields = webhook.metadata.interface.map(({ name }) => name);

  assert.deepEqual(fields, [
    "name",
    "email",
    "message",
    "projectIdea",
    "projectType",
    "submissionType",
    "forwardedAt",
  ]);

  const serialized = JSON.stringify(blueprint);
  assert.doesNotMatch(serialized, /hooks\.make\.com/i);
  assert.doesNotMatch(serialized, /x-make-apikey/i);
  assert.doesNotMatch(serialized, /ES_[A-Za-z0-9_-]{12,}/);
  assert.doesNotMatch(serialized, /abstractapi|api_key=/i);
  assert.equal(findModule(blueprint, 15), null);
  assert.equal(findModule(blueprint, 16), null);
});

test("removes external company enrichment and clears its Sheet mappings", () => {
  const blueprint = transformBlueprint(source);

  for (const id of [12, 13, 14]) {
    const values = findModule(blueprint, id).mapper.values;
    assert.equal(values["4"], "Not collected");
    assert.equal(values["5"], "");
    assert.equal(values["6"], "");
  }
});

test("makes contact routes mutually exclusive and keeps AI separate", () => {
  const blueprint = transformBlueprint(source);
  const recruiter = filterText(findModule(blueprint, 12));
  const project = filterText(findModule(blueprint, 13));
  const general = filterText(findModule(blueprint, 14));
  const ai = filterText(findModule(blueprint, 17));

  for (const contactFilter of [recruiter, project, general]) {
    assert.match(contactFilter, /contact_form/);
  }
  assert.match(project, /notcontain/);
  assert.match(project, /recruiter/);
  assert.match(general, /notcontain/);
  assert.match(general, /project/);
  assert.match(general, /recruiter/);
  assert.match(ai, /ai_scoper/);
  assert.doesNotMatch(ai, /contact_form/);
});

test("pins user acknowledgements to submitted email and owner notices to a fixed address", () => {
  const blueprint = transformBlueprint(source);

  for (const id of [9, 10, 11, 23]) {
    const recipient = findModule(blueprint, id).mapper.to;
    assert.match(JSON.stringify(recipient), /^"?\[?"?\{\{1\.email\}\}/);
  }

  for (const id of [24, 25, 26]) {
    const notice = findModule(blueprint, id);
    assert.ok(notice);
    assert.equal(notice.mapper.to[0], "johnmichaelbonganay1231@gmail.com");
    assert.doesNotMatch(JSON.stringify(notice.mapper), /\{\{1\.(?:name|email|message|projectIdea)\}\}/);
  }
});

test("contains untrusted AI input and bounds model generation", () => {
  const blueprint = transformBlueprint(source);
  const gemini = findModule(blueprint, 17);
  const prompt = JSON.stringify(gemini.mapper.system_instruction);
  const contents = JSON.stringify(gemini.mapper.contents);

  assert.match(prompt, /untrusted/i);
  assert.match(prompt, /ignore.*instructions/i);
  assert.match(prompt, /exactly four/i);
  assert.match(contents, /<UNTRUSTED_PROJECT_IDEA>/);
  assert.match(contents, /<\/UNTRUSTED_PROJECT_IDEA>/);
  assert.equal(contents.match(/\{\{1\.projectIdea\}\}/g)?.length, 1);
  assert.equal(gemini.mapper.generationConfig.temperature, 0.2);
  assert.ok(gemini.mapper.generationConfig.maxOutputTokens <= 1600);
});

test("uses a safe document name and preserves trusted attachment provenance", () => {
  const blueprint = transformBlueprint(source);
  const document = findModule(blueprint, 19);
  const exportFile = findModule(blueprint, 22);
  const email = findModule(blueprint, 23);

  assert.doesNotMatch(document.mapper.name, /\{\{1\./);
  assert.equal(exportFile.mapper.file, "{{19.id}}");
  assert.equal(exportFile.mapper.formatDocuments, "application/pdf");
  assert.deepEqual(email.mapper.attachments, [
    { data: "{{22.data}}", filename: "{{22.name}}" },
  ]);
});

test("validates expected modules, unique IDs, and hardened invariants", () => {
  const blueprint = transformBlueprint(source);
  assert.doesNotThrow(() => validateBlueprint(blueprint));

  const broken = structuredClone(blueprint);
  findModule(broken, 17).mapper.generationConfig.maxOutputTokens = 9000;
  assert.throws(() => validateBlueprint(broken), /output token/i);
});
