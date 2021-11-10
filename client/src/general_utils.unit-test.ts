import { hex_to_rgb } from "./general_utils";

describe("hex_to_rgb", () => {
  it("coverts a hex colour string to an rgb object", () => {
    return expect(hex_to_rgb("c54636")).toEqual({ r: 197, g: 70, b: 54 });
  });
});
