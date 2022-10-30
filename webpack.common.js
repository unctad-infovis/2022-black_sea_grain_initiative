const path = require('path');
const name = require('./package.json').name;
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');


module.exports = {
  entry: {
    app: './src/index.js'
  },
  name:name,
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
              url: false
            }
          },
          {
            loader: 'less-loader'
          }
        ]
      },
      {
        test: /\.css$/,
        include: /node_modules\//,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.(png|jp(e*)g|svg|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              emitFile: false,
              name:'[path][name].[ext]'
            }
          }
        ]
      }
    ]
  },
  output: {
    filename: 'js/' + name + '.min.js',
    path: path.resolve(__dirname, './public'),
    clean: true
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/' + name + '.min.css'
    }),
    new HtmlWebPackPlugin({
      title: name,
      template: "./src/html/index.html",
      filename: "./index.html"
    }),
    new CopyPlugin({
      patterns: [
        { from: 'assets/img/', to: '../public/assets/img/', noErrorOnMissing: true, globOptions: { dot: true, gitignore: true, ignore: ['**/.DS_Store'] }},
        { from: 'assets/data/JCC data - data.csv', to: '../public/assets/data/2022-black_sea_grain_initiative_table.csv', noErrorOnMissing: true, globOptions: { dot: true, gitignore: true, ignore: ['**/.DS_Store'] }},
        { from: 'assets/data/JCC data - figure_3.csv', to: '../public/assets/data/2022-black_sea_grain_initiative_figure_3.csv', noErrorOnMissing: true, globOptions: { dot: true, gitignore: true, ignore: ['**/.DS_Store'] }},
        { from: 'assets/data/JCC data - figure_7.csv', to: '../public/assets/data/2022-black_sea_grain_initiative_figure_7.csv', noErrorOnMissing: true, globOptions: { dot: true, gitignore: true, ignore: ['**/.DS_Store'] }},
        { from: 'assets/data/JCC data - figure_6.csv', to: '../public/assets/data/2022-black_sea_grain_initiative_figure_6.csv', noErrorOnMissing: true, globOptions: { dot: true, gitignore: true, ignore: ['**/.DS_Store'] }},
        { from: 'assets/data/JCC data - figure_10.csv', to: '../public/assets/data/2022-black_sea_grain_initiative_figure_10.csv', noErrorOnMissing: true, globOptions: { dot: true, gitignore: true, ignore: ['**/.DS_Store'] }},
        { from: 'assets/data/fao_food_price_index.csv', to: '../public/assets/data/fao_food_price_index.csv', noErrorOnMissing: true, globOptions: { dot: true, gitignore: true, ignore: ['**/.DS_Store'] }},
        { from: 'src/font/', to: '../public/font/', noErrorOnMissing: true, globOptions: { dot: true, gitignore: true, ignore: ['**/.DS_Store'] }},
        { from: './favicon.png', to: '../public', noErrorOnMissing: true, globOptions: { dot: true, gitignore: true, ignore: ['**/.DS_Store'] }}
      ]
    })
  ]
};