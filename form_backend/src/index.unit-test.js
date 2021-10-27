import axios from "axios";

// index.js has an on-load side effect of starting the server
import { form_backend } from "./index.js"; // eslint-disable-line no-unused-vars

describe("form_backend/index.js (the GCF entry point)", () => {
  it("Starts server as an on-load side-effect", async () => {
    const server_response = await axios.get(
      `http://127.0.0.1:7331/form_template_names`
    );
    return expect(server_response.status).toBe(200);
  });
});
