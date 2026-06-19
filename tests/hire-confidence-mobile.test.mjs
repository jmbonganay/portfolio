import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("hire confidence footer stacks copy and actions on mobile", async () => {
  const css = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");
  const sectionStart = css.indexOf("WHY CLIENTS HIRE ME");
  const mobileStart = css.indexOf("@media (max-width: 720px) {", sectionStart);
  const mobileEnd = css.indexOf("@media (hover: none)", mobileStart);
  const mobileCss = css.slice(mobileStart, mobileEnd);

  assert.match(
    mobileCss,
    /\.hire-confidence-footer \{[^}]*grid-template-columns: 1fr;[^}]*align-items: start;/,
  );
});
