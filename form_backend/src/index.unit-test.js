import axios from "axios";

import { form_backend } from "./index.js";

describe("form_backend/index.js (the GCF entry point)", () => {
  it("Starts express server as an on-load side-effect", async () => {
    const server_response = await axios.get(
      `http://127.0.0.1:${form_backend.get("port")}/form_template_names`
    );
    return expect(server_response.status).toBe(200);
  });
});
