module.exports = {
    // Used as the name for the distributable war file
    name: 'covidshare-ui',

    // Location of the war file to be built
    distFolder: 'dist',

    // Host address for dev server
    devAddress: 'localhost',

    // Port for dev server
    devPort: 3000,

    // Used as "contentBase" for webpack-dev-server
    // Allows you to import scripts in index.html from other folders
    devScriptFolders: ['./lib'],

    // List of files/folders that will be copied into the production war file
    prodScripts: ['./lib/**/*'],

    // Name of the polyfill bundle file
    polyfillBundleName: 'polyfill-bundle.js',

    // Folder where files are temporarily stored during the dev/build process
    tempFolder: '.dev',

    buildFolder: '.build',
};
