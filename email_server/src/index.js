// entry-point, for both dev and GCF
import { make_email_server } from './email_server.js';
import { get_templates } from './template_utils';

const email_server = (async () => {
  const templates = await get_templates();
  
  return make_email_server(templates);
})();

export { email_server };