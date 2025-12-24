const swcDefaultConfig = {
  module: {
    type: 'commonjs',
  },
  jsc: {
    target: 'es2021',
    parser: {
      syntax: 'typescript',
      decorators: true,
      dynamicImport: true,
    },
    transform: {
      legacyDecorator: true,
      decoratorMetadata: true,
    },
    keepClassNames: true,
    externalHelpers: false,
  },
  sourceMaps: true,
};

module.exports = function (options, context) {
  return {
    ...options,
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: {
            loader: "swc-loader",
            options: swcDefaultConfig,
          },
        },
      ],
    },
  };
};
