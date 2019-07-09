const _ = require('lodash');

global._ = _;
global.IS_DEV_SERVER = !(process.env.SHOULD_USE_REMOTE_DB);

const app = require('./app');

// let's set the port on which the server will run
app.set( 'port', 1337 );

// start the server
app.listen(
  app.get('port'),
  () => {
    const port = app.get('port');
    console.log(`GraphQL Server Running at http://127.0.0.1:${port}`); // eslint-disable-line no-console
  }
);