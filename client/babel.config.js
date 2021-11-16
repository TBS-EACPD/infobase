// eslint-disable-next-line import/no-commonjs
module.exports = function (api) {
  return {
    plugins: [
      ["@babel/plugin-proposal-decorators", { decoratorsBeforeExport: false }],
    ],
    presets: [
      [
        "@babel/preset-env",
        {
          useBuiltIns: "entry",
          corejs: { version: "3.18" },
          targets: api.env("production") ? ["IE 11", "Safari 7"] : "defaults",
        },
      ],
      "@babel/preset-react",
      "@babel/preset-typescript",
    ],
  };
};
