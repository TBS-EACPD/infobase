window.APPLICATION_LANGUAGE = "en";
window.matchMedia = jest.fn().mockImplementation((query) => {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
  };
});
require("regenerator-runtime/runtime"); // async breaks without this
require("src/handlebars/register_helpers.side-effects.js");
