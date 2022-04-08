const webpack = require('webpack');
const MiniCssExtractPlugin = 'mini-css-extract-plugin';
const CspHtmlWebpackPlugin = require('csp-html-webpack-plugin');
const path = require('path');
const padStart = require('lodash.padStart');

const gulpConfig = require('./gulpfile.config');

const date = new Date();
const timestamp = `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}_${padStart(
    date.getHours(),
    2,
    '0'
)}-${padStart(date.getMinutes(), 2, '0')}-${padStart(date.getSeconds(), 2, '0')}`;

const config = {
    mode: 'production',
    entry: {
        app: ['./src/index.tsx'],
    },
    output: {
        path: path.resolve(__dirname, `../${gulpConfig.buildFolder}`),
        filename: `./[name].${timestamp}.js`,
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                    },
                    'css-loader?-url',
                ],
            },
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                    },
                    'css-loader',
                    'resolve-url-loader',
                    'sass-loader?sourceMap',
                ],
            },
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
        new MiniCssExtractPlugin({ filename: `app.bundle.${timestamp}.css` }),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production'),
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
