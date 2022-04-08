const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const WebpackDevServer = require('webpack-dev-server');

const gulp = require('gulp');
const concat = require('gulp-concat');
const gulpTslint = require('gulp-tslint');
const gutil = require('gulp-util');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const zip = require('gulp-zip');

const tslint = require('tslint');
const del = require('del');
const pump = require('pump');
const path = require('path');
const fs = require('fs');

const Config = require('./config/gulpfile.config');
const webpackDevConfig = require('./config/webpack.config.dev');
const webpackProdConfig = require('./config/webpack.config.prod');

/**
 * Compiles the sources code and places the bundle in the buildFolder
 */
gulp.task('build', webpackBuild);

/**
 * Production build
 */
gulp.task('prod', gulp.series(tslintProd, 'build', buildWar));

/**
 * Start the dev server
 */
gulp.task('dev', gulp.series(tslintDev, gulp.parallel(watchTslint, webpackDevServer)));

/**
 * Remove build folders
 */
gulp.task('clean', clean);

const TYPESCRIPT_FILES = ['src/**/*.ts', 'src/**/*.tsx'];

function watchTslint() {
    gulp.watch(TYPESCRIPT_FILES, tslintDev);
}

function tslintDev() {
    const program = tslint.Linter.createProgram('./tsconfig.json');
    return gulp
        .src(TYPESCRIPT_FILES.concat(['!src/shared/**/*']))
        .pipe(gulpTslint({ program, formatter: 'stylish' }))
        .pipe(gulpTslint.report({ allowWarnings: true, emitError: false }));
}

function tslintProd(done) {
    const program = tslint.Linter.createProgram('./tsconfig.json');
    gulp.src(TYPESCRIPT_FILES.concat(['!src/shared/**/*']))
        .pipe(gulpTslint({ program, formatter: 'verbose' }))
        .pipe(gulpTslint.report({ allowWarnings: true, emitError: false }))
        .on('end', () => {
            gutil.log(gutil.colors.green('TSLint passed successfully'));
            done();
        })
        .on('error', (e) => {
            gutil.log(gutil.colors.red('TSLint linting failed'));
            done(e);
        });
}

function webpackDevServer() {
    webpackDevConfig.entry.app = [
        `webpack-dev-server/client?http://${Config.devAddress}:${Config.devPort}`,
        'webpack/hot/dev-server',
    ].concat(webpackDevConfig.entry.app);

    const config = webpackDevConfig;
    const html = new HtmlWebpackPlugin({
        template: './public/index.html',
        inject: false,
        templateParameters: (compilation, assets, options) => ({
            bundle: assets.js[0],
            css: assets.css[0],
            // config: 'config.js',
            // polyfills: Config.polyfillBundleName,
        }),
    });
    config.plugins.unshift(html);
    config.devtool = 'cheap-module-source-map';

    new WebpackDevServer(webpack(config), {
        historyApiFallback: true,
        contentBase: ['./public'].concat(Config.devScriptFolders).concat(Config.tempFolder),
        hot: true,
        // https: true,
        stats: {
            children: true,
            chunks: false,
            chunkModules: false,
            modules: false,
            colors: true,
        },
    }).listen(Config.devPort, Config.devAddress, (err) => {
        if (err) {
            throw new gutil.PluginError('webpack-dev-server', err);
        }
    });

    // Start mock server
    // var startServer = require('./mock-server/server.js)
    // startServer(3001)
}

function webpackBuild(done) {
    gutil.log(gutil.colors.cyan('Creating minified production build...'));

    const config = webpackProdConfig;
    config.plugins = config.plugins.concat([
        new HtmlWebpackPlugin({
            template: './public/index.html',
            inject: false,
            templateParameters: (compilation, assets, options) => ({
                bundle: assets.js[0],
                css: assets.css[0],
                // config: 'config.js',
                // polyfills: Config.polyfillBundleName,
            }),
        }),
        new CssMinimizerPlugin(),
    ]);
    config.devtool = 'none';

    webpack(config, (err, stats) => {
        if (err) {
            throw new gutil.PluginError('webpackBuildUnminified', err);
        }

        if (stats.hasErrors()) {
            stats.toJson().errors.forEach((error) => console.error(error));
            throw new gutil.PluginError('webpackBuildUnminified', 'Failed to compile');
        }

        gutil.log(gutil.colors.green('Successfully compiled'));
        done();
    });
}

function clean() {
    return del([`./${Config.tempFolder}`, `./${Config.buildFolder}`]);
}

function buildWar() {
    gutil.log(gutil.colors.cyan(`Creating ${Config.name}.war in './${Config.distFolder}...`));

    return Promise.all([
        copyPromise(['./public/**/*', '!./public/config*', '!./public/index.html'], `./${Config.tempFolder}`),
        copyPromise('./public/config.prod.js', `./${Config.tempFolder}`, [rename('config.js')]),
        copyPromise(Config.prodScripts, `./${Config.tempFolder}`),
        copyPromise(`./${Config.buildFolder}/**/*`, `./${Config.tempFolder}`),
    ]).then(() => {
        copyPromise(`./${Config.tempFolder}/**/*`, `./${Config.distFolder}`, [zip(`${Config.name}.war`)]);
        // copyPromise(`./${Config.tempFolder}/**/*`, `./${Config.distFolder}/${Config.name}`);
    });
}

function copyPromise(source, destination, transforms) {
    return new Promise((resolve, reject) => copy(source, destination, transforms, resolve));
}

/**
 * Convenience function wrapping pump and gulp.src/dest w/ transforms
 * @param {*} source - Glob for source files
 * @param {*} destination - Destination path
 * @param {*} transforms - Any gulp transformations to use
 * @param {*} cb - Callback function when done
 * @returns
 */
function copy(source, destination, transforms, cb) {
    cb = cb || (() => {}); // If no cb is passed, use a no-op
    const streams = [gulp.src(source), gulp.dest(destination)];
    if (transforms) {
        streams.splice(1, 0, ...transforms.filter((t) => !!t));
    }
    return pump(streams, cb);
}
