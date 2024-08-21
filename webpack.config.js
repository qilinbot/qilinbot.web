const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const path = require('path');

// todo 字体文件的打包存在未加载 目前通过link引入
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
          loader: 'css-loader',
          options: {
            url: true,
          }
        }],
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
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
};
