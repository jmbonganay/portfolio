import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("the public resume retains professional content without private logistics", async () => {
  const pdf = await readFile(
    new URL("../public/JohnMichael_Bonganay_Resume.pdf", import.meta.url),
  );
  const content = pdf.toString("latin1");

  for (const required of [
    "JOHN MICHAEL BONGANAY",
    "Philippines - Remote",
    "PROFESSIONAL SUMMARY",
    "EXPERIENCE",
    "SKILLS",
    "EDUCATION",
    "Bicol University",
  ]) {
    assert.match(content, new RegExp(required, "i"));
  }

  for (const privateDetail of [
    "Tabaco City",
    "REMOTE WORK READINESS",
    "Power Backup",
    "Generator",
    "MacBook Air",
    "Ryzen",
    "RTX 4060",
    "Dual monitors",
    "home office",
  ]) {
    assert.doesNotMatch(content, new RegExp(privateDetail, "i"));
  }
});
