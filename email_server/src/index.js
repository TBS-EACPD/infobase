// this file is the entry-point for GCF, it won't be used in dev
import { email_server } from './email_server.js';
global.IS_DEV_SERVER = false;
export { email_server }