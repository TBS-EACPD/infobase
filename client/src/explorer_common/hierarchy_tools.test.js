import { hierarchy } from "d3-hierarchy";

import {
  filter_hierarchy,
  convert_d3_hierarchy_to_explorer_hierarchy,
} from "./hierarchy_tools.js";

test("test d3 hierarchy", () => {
  const d3_h7y = hierarchy({
    name: "root",
    children: [
      {
        name: "1",
        children: [{ name: "1.1" }],
      },
      {
        name: "2",
      },
    ],
  });
  const expl_h7y = convert_d3_hierarchy_to_explorer_hierarchy(d3_h7y);
  expect(expl_h7y.length).toBe(4);
});
