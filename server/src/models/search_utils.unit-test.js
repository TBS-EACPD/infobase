// TODO want a lot more tests here, but I think I want to leave that till after https://github.com/TBS-EACPD/infobase/pull/1294 is merged.
// For now, most functionality is covered by the services snapshot tests (NOT good enough long term, though)

import { make_schema_with_search_terms } from "./search_utils.js";

describe("make_schema_with_search_terms", function () {
  const schema_def = {
    id: { type: String, required: true, unique: true, index: true },
    unsearchable: { type: String },
    name_en: { type: String },
    name_fr: { type: String },
    lang_agnostic: { type: Number },
  };
  const schema = make_schema_with_search_terms(
    schema_def,
    "name_en",
    "name_fr",
    "lang_agnostic"
  );

  it("Adds en, fr, and bi search term fields to schema", () => {
    expect(schema.paths).toHaveProperty("search_terms_en");
    expect(schema.paths).toHaveProperty("search_terms_fr");
    expect(schema.paths).toHaveProperty("search_terms_bi");
  });
});
