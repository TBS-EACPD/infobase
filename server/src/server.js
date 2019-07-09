const { exec } = require('child_process');
const pids = require('port-pid');
const _ = require('lodash');

global._ = _;
global.IS_DEV_SERVER = !(process.env.SHOULD_USE_REMOTE_DB);

const app = require('./app');

// This is only the entry point for development, the prod entry point is index.js

const port = 1337;

app.set('port', port);

const kill_process_using_port = (callback = () => {}) => pids(port)
  .then(
    pids => {
      const debounced_callback = _.debounce(callback, 10)
      pids.all.forEach( pid => exec(`kill -9 ${pid}`, debounced_callback) )
    }
  );
 
// make sure all child process on the port we're using die when the node process exits
process.on('exit', kill_process_using_port);

// kill any open processes squating on 1337, then start our app
kill_process_using_port(
  () => app
    .listen(
      app.get('port'),
      () => {
        const port = app.get('port');
        console.log('GraphQL Server Running at http://127.0.0.1:' + port ); // eslint-disable-line no-console
      }
    )
); 