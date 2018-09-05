var ModuleLoader = require( './modules' );

// Expose the entry chunk through libraryTarget and library. This allows public access via
// ResourceLoader's module system e.g. `mw.mobileFrontend.require('mobile.startup/LoadingOverlay')`.
// todo: don't set mw.mobileFrontend in modules.js. Make a new instance to export here instead.
module.exports = {
	ModuleLoader: ModuleLoader
};
