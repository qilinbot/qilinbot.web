const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
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
        exclude: /node_modules/, // 排除 node_modules 文件夹中的 CSS 文件
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              url: true,
            }
          },
          'postcss-loader', // 仅处理项目内的 CSS 文件
        ],
      },
      {
        test: /\.css$/,
        include: /node_modules/, // 处理 node_modules 中的 CSS 文件
        use: [
          MiniCssExtractPlugin.loader, // 提取 CSS 到单独的文件
          'css-loader',
        ],
      },
      {
        test: /\.ttf$/,
        include: [
          path.resolve(__dirname, 'src'),  // 项目源代码路径
          path.resolve(__dirname, 'node_modules/monaco-editor') // monaco-editor 路径
        ],
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
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
};
