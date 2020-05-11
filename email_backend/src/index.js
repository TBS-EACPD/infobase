// entry-point, for both dev and GCF
import { connect_db } from "./db_utils";
import { make_email_backend } from "./email_backend.js";
import { get_templates } from "./template_utils";

const email_backend = (() => {
  const templates = get_templates();

  // Start connecting to the db early and let it happen fully async. Attempts to write to it
  // before the connection is ready will buffer until the connection is ready
  connect_db(); // Note: async func, but not awaited

  const email_backend = make_email_backend(templates);

  if (!process.env.IS_PROD_SERVER) {
    email_backend.set("port", 7331);
    email_backend.listen(email_backend.get("port"), () => {
      const port = email_backend.get("port");
      //eslint-disable-next-line no-console
      console.log(`InfoBase email backend running at http://127.0.0.1:${port}`);
    });
  }

  return email_backend;
})();

export { email_backend };
