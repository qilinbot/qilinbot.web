const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const path = require('path');

module.exports = {
  entry: {
    main: './src/main.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: '/', // 确保文件能够通过服务器的根路径访问
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', {
          loader: 'css-loader', options: {
            url: false,
          }
        }],
      },
      {
        test: /\.ttf$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/', // 将字体文件输出到 dist/fonts 目录下
              publicPath: '/fonts/', // 引用时的路径
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new MonacoWebpackPlugin({
      languages: ['javascript', 'typescript'],
    }),
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
};
