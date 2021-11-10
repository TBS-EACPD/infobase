module.exports = {
  env: {
    test: {
      plugins: [
        [
          "@babel/plugin-proposal-decorators",
          { decoratorsBeforeExport: false },
        ],
      ],
      presets: [
        [
          "@babel/preset-env",
          {
            useBuiltIns: "entry",
            corejs: { version: "3.18" },
            targets: "defaults",
          },
        ],
        "@babel/preset-react",
        "@babel/preset-typescript",
      ],
    },
  },
};
