// entry-point, for both dev and GCF

import { run_email_backend } from "./email_backend.js";

const email_backend = (() => run_email_backend)();

export { email_backend };
