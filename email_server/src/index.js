// entry-point, for both dev and GCF
import { make_email_server } from './email_server.js';
import { get_templates } from './template_utils';

const email_server = async () => {
  const templates = await get_templates();
  
  const email_server = make_email_server(templates);

  if (!process.env.IS_PROD_SERVER){
    email_server.set('port', 7331);
    email_server.listen(
      email_server.get('port'),
      () => {
        const port = email_server.get('port');
        //eslint-disable-next-line no-console
        console.log(`InfoBase email server running at http://127.0.0.1:${port}`);
      }
    );
  }

  return email_server;
};

!process.env.IS_PROD_SERVER && email_server();

export { email_server };