module.exports = {
  // setupTestFrameworkScriptFile: "./src/set_up_tests.js",
  setupFilesAfterEnv: ["./src/set_up_tests.js"],
  // setupFiles: ["./src/set_up_tests.js"],
  testRegex: "src\\/.+\\.test\\.js?$",
  // testEnvironment: "jsdom",
};