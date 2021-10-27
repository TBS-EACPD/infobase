// entry-point for GCF

import { run_form_backend } from "./form_backend.js";

const form_backend = (() => run_form_backend())();

export { form_backend };
