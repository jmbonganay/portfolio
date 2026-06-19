import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("the downloadable and output resumes stay synchronized", async () => {
  const [publicPdf, outputPdf] = await Promise.all([
    readFile(new URL("../public/JohnMichael_Bonganay_Resume.pdf", import.meta.url)),
    readFile(new URL("../output/pdf/JohnMichael_Bonganay_Resume.pdf", import.meta.url)),
  ]);
  const content = publicPdf.toString("latin1");

  assert.deepEqual(publicPdf, outputPdf);
  assert.match(content, /^%PDF-1\.4/);
  assert.match(content, /\/Title\(JohnMichael_Bonganay_Resume\)/);
  assert.equal(content.match(/\/Type\/Page(?!s)\b/g)?.length, 2);
  assert.match(content.trimEnd(), /%%EOF$/);
});
