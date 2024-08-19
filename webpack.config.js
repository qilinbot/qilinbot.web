const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const path = require('path');
module.exports = {
  entry: {
    main: './src/main.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: '/' // 确保文件能够被正确访问
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.ttf$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/', // 确保字体文件被放到正确的位置
              publicPath: 'fonts/' // 确保路径正确
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new MonacoWebpackPlugin({
      languages: ['javascript', 'typescript'],
    })
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
    }
  }
};
