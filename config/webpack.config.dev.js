const webpack = require('webpack');
const CspHtmlWebpackPlugin = require('csp-html-webpack-plugin');
const path = require('path');

const config = {
    mode: 'development',
    entry: ['./src/index.tsx'],
    output: {
        path: path.resolve(__dirname, 'dev'),
        filename: 'bundle.js',
    },
    module: {
        rules: [
            { test: /\.css$/, loader: 'style-loader ! css-loader?-url' },
            { test: /\.scss$/, loaders: ['style-loader', 'css-loader', 'resolve-url-loader', 'sass-loader?sourceMap'] },
            {
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                use: { loader: 'ts-loader', options: { transpileOnly: true, experimentalWatchApi: true } },
            },
            {
                test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'url-loader?limit=10000&mimetype=application/font-woff',
            },
            { test: /\.(eot|ttf|svg|woff|woff2)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'file-loader?name=[name].[ext]' },
        ],
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('development'), // set to 'production' to test IE
            },
        }),
        new webpack.HotModuleReplacementPlugin(),
        new CspHtmlWebpackPlugin(
            {
                'base-uri': "'self'",
                'object-src': "'none'",
                'script-src': ["'unsafe-inline'", "'self'", "'unsafe-eval'"],
                'style-src': ["'unsafe-inline'", "'self'", "'unsafe-eval'"],
            },
            {
                enabled: true,
                hashingMethod: 'sha256',
                hashEnabled: {
                    'script-src': true,
                    'style-src': true,
                },
                nonceEnabled: {
                    'script-src': false,
                    'style-src': false,
                },
            }
        ),
    ],
    resolve: {
        modules: [path.resolve('./'), 'node_modules'],
        extensions: ['.js', '.ts', '.tsx'],
    },
};

module.exports = config;
