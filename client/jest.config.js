module.exports = {
  moduleDirectories: ["./", "node_modules"],
  setupFilesAfterEnv: ["./src/testing/set_up_tests.js"],
  testRegex: "src\\/.+\\.test\\.js?$",
  moduleNameMapper: {
    "\\.(css|scss)$": "<rootDir>/src/testing/styleMock.js",
  },
  transform: {
    "^.+\\.yaml$": "./src/testing/yaml-lang-transform.js",
    "^.+\\.js$": "babel-jest",
    "^.+\\.csv$": "./src/testing/raw-transform.js",
    //Note that webpack's svg-inline-loader applies minor transformations, let's hope they don't matter to tests, though
    "^.+\\.(csv|svg)$": "./src/testing/raw-transform.js",
  },
};
