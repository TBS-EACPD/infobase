window.APPLICATION_LANGUAGE = "en";
window.matchMedia = jest.fn().mockImplementation(query => {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
  };
});

require('../app_bootstrap/inject_app_globals.side-effects.js');
require('../handlebars/helpers.side-effects.js');