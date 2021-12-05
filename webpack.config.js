const path = require('path');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = [{
	entry: './src/example/index.ts',
	output: {
		filename: './main.js',
		path: path.resolve(__dirname, 'example')
	},
	devtool: 'inline-source-map',
	plugins: [
		new CleanWebpackPlugin(),
		new HtmlWebpackPlugin({
			filename: 'index.html',
			template: './src/example/index.html',
			minify: false
		}),
	],
	module: {
		rules: [
			{
				test: /\.ts|.tsx$/,
				loader: 'ts-loader',
				exclude: /node_modules/,
				options: {configFile: 'tsconfig.dev.json'}
			}
		]
	},
	resolve: {
		extensions: ['.ts', '.js']
	},
}];
