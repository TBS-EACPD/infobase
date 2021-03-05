import { create_text_maker, trivial_text_maker, run_template } from "./text.js";

import test_content from "./test_content.yaml";

describe("text_maker", () => {
  describe("run_template", () => {
    it("should run handlebar templates", () => {
      expect(run_template("{{ppl_last_year_5}}")).toEqual(
        expect.stringMatching(/20\d\d/)
      );
    });
  });

  describe("trival_text_maker", () => {
    it("should have access to a certain set of global text keys", () => {
      expect(trivial_text_maker("notapplicable")).toEqual("Not Applicable");
    });
  });

  describe("custom_text_makers", () => {
    it("should work", () => {
      const tm_func = create_text_maker(test_content);

      const example_with_helpers = tm_func("some_key_with_hbs_helpers", {
        dynamic_key: "other_simple_key",
      });
      expect(example_with_helpers).toMatchSnapshot();

      const example_with_hbs_and_md = tm_func("some_key_with_hbs_and_md", {
        show_block_of_text: true,
        html_block_of_text: `
          This should show up twice, once <strong>escaped</strong> and once <span> unescaped </span>
          <div style="width:100px;height:100px;background-color:red;"></div>
        `,
        list: ["a", "b", "c"],
      });
      expect(example_with_hbs_and_md).toMatchSnapshot();
    });
  });
});
