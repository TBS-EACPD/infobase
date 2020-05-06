const { route_load_tests_config } = require('../../client/browser-tests/route-load-tests-config.js');

module.exports = {
  "ci": {
    "collect": {
      "url": _.map(route_load_tests_config, ({route}) => 
        `https://dev.ea-ad.ca/${process.env.CIRCLE_BRANCH}/index-eng.html#${route}`
      )
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}