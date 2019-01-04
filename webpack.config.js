/* eslint-env node, es6 */
const
	CleanPlugin = require( 'clean-webpack-plugin' ),
	glob = require( 'glob' ),
	path = require( 'path' ),
	isProduction = process.env.NODE_ENV === 'production',
	// The output directory for all build artifacts. Only absolute paths are accepted by
	// output.path.
	distDir = path.resolve( __dirname, 'resources/dist' ),
	// The extension used for source map files.
	srcMapExt = '.map.json',
	ENTRIES = {
		tests: 'tests.mobilefrontend',
		hogan: 'mediawiki.template.hogan',
		startup: 'mobile.startup',
		languages: 'mobile.languages.structured'
	};

module.exports = {
	// Apply the rule of silence: https://wikipedia.org/wiki/Unix_philosophy.
	stats: {
		all: false,
		errors: true,
		warnings: true
	},

	// Fail on the first build error instead of tolerating it for prod builds. This seems to
	// correspond to optimization.noEmitOnErrors.
	bail: isProduction,

	// Specify that all paths are relative the Webpack configuration directory not the current
	// working directory.
	context: __dirname,

	// A map of ResourceLoader module / entry chunk names to JavaScript files to pack. E.g.,
	// "mobile.startup" maps to src/mobile.startup/mobile.startup.js. The JavaScript entry could be
	// named simply "index.js" but the redundancy of "[name].js" improves presentation and search-
	// ability in some tools. Entry names are tightly coupled to output.filename and extension.json.
	entry: {
		// Note that the tests.mobilefrontend module only exists inside Special:JavaScriptTest test
		// runs. It provides scaffolding (template mocks) and does not appear inside the
		// ResourceLoader startup module, so does not use the `mobile.` prefix that other modules
		// do. This is consistent with other test related artifacts. E.g.,
		// test.mediawiki.qunit.testrunner and test.sinonjs.
		// The glob module is used to ensure that all tests inside the folder (minus stubs) are
		// caught and run to ensure we don't forget to register new tests.
		[ENTRIES.tests]: glob.sync( './tests/node-qunit/*/*.test.js' ),

		// mobile.startup.runtime: reserved entry for the Webpack bootloader
		// optimization.runtimeChunk. Without a distinct runtime chunk, it's instead bundled into
		// each entry which is inefficient. This chunk should only change when Webpack or this
		// configuration changes.

		[ENTRIES.hogan]: './src/mediawiki.template.hogan/mediawiki.template.hogan.js',
		[ENTRIES.startup]: './src/mobile.startup/mobile.startup.js',
		// T210210: Make a new chunk (which will be lazy loaded by resource loader).
		// If we utilize webpack lazy loading instead of resource loader lazy
		// loading, we won't be required to explicitly create this new chunk and
		// this can be removed.
		[ENTRIES.languages]: './src/mobile.languages.structured/mobile.languages.structured.js'
	},

	// tests.mobilefrontend has additional dependencies but they're provided externally. This code
	// can be removed if tests.mobilefrontend is removed.
	externals: [ 'jquery', 'jsdom', 'oojs', 'sinon', 'qunit', 'fs', 'path' ],
	resolve: {
		alias: {
			// This avoids leaking unnecessary code into the webpack test build
			'./mockMediaWiki': path.resolve( __dirname, 'tests/node-qunit/utils/blank.json' )
		}
	},
	optimization: {
		// Don't produce production output when a build error occurs.
		noEmitOnErrors: isProduction,

		// Use filenames instead of unstable numerical identifiers for file references. This
		// increases the gzipped bundle size some but makes the build products easier to debug and
		// appear deterministic. I.e., code changes will only alter the bundle they're packed in
		// instead of shifting the identifiers in other bundles.
		// https://webpack.js.org/guides/caching/#deterministic-hashes (namedModules replaces NamedModulesPlugin.)
		namedModules: true,

		// Generate a single Webpack bootstrap chunk for ResourceLoader modules to share. This will
		// be packaged inside the mediawiki.template.hogan module which should be a dependency for
		// all modules. The inefficient  alternative is for each module to bundle its own runtime.
		// The terms bootloader and runtime are used interchangeably.
		runtimeChunk: { name: 'mobile.startup.runtime' },
		splitChunks: {
			cacheGroups: {
				// Turn off webpack's default 'default' cache group.
				// https://webpack.js.org/plugins/split-chunks-plugin/#optimization-splitchunks
				'default': false,
				// Turn off webpack's default 'vendors' cache group. If this is desired
				// later on, we can explicitly turn this on for clarity.
				// https://webpack.js.org/plugins/split-chunks-plugin/#optimization-splitchunks
				vendors: false,
				// TT210210: This was undesirably added when trying to get lazy loaded
				// modules to work (e.g. ENTRIES.languages). It will excise modules
				// shared between lazy loaded chunks and mobile.startup into a new
				// 'mobile.common' chunk. Ideally, the common chunk would be merged into
				// the mobile.startup chunk and would not exist. However, there was
				// difficulty in making webpack cleanly do this. When we overcome
				// webpack lazy loading hurdles (or figure out a way to make webpack use
				// mobile.startup as the common chunk), we won't be required to do this.
				common: {
					name: 'mobile.common',
					// Minimum num of chunks module must share before excising into common
					// chunk
					minChunks: 2,
					// Do no reuse existing chunks when splitting (i.e. we do not want
					// webpack excising startup modules into an async chunk)
					// https://github.com/webpack/webpack.js.org/issues/2122#issuecomment-388609306
					reuseExistingChunk: false,
					// ignore webpack's default minSize option (and other splitChunks
					// defaults) and always create chunks based on criteria specified for
					// this cacheGroup
					enforce: true,
					// Only consider splitting chunks off of these whitelisted entry names
					chunks: ( chunk ) => [ ENTRIES.startup, ENTRIES.languages ].includes(
						chunk.name )
				}
			}
		}
	},

	output: {
		// Specify the destination of all build products.
		path: distDir,

		// Store outputs per module in files named after the modules. For the JavaScript entry
		// itself, append .js to each ResourceLoader module entry name. This value is tightly
		// coupled to sourceMapFilename.
		filename: '[name].js',

		// Rename source map extensions. Per T173491 files with a .map extension cannot be served
		// from prod.
		sourceMapFilename: `[file]${srcMapExt}`,

		// Expose the module.exports of each module entry chunk through the global
		// mfModules[name].
		// This is useful for debugging. E.g., mfModules['mobile.startup'] is set by the
		// module.exports of mobile.startup.js.
		library: [ 'mfModules', '[name]' ],
		libraryTarget: 'this'
	},

	// Accurate source maps at the expense of build time. The source map is intentionally exposed
	// to users via sourceMapFilename for prod debugging. This goes against convention as source
	// code is publicly distributed.
	devtool: 'source-map',

	plugins: [
		// Delete the output directory on each build.
		new CleanPlugin( distDir, { verbose: false } )
	],

	performance: {
		// Size violations for prod builds fail; development builds are unchecked.
		hints: isProduction ? 'error' : false,

		// Minified uncompressed size limits for chunks / assets and entrypoints. Keep these numbers
		// up-to-date and rounded to the nearest 10th of a kilobyte so that code sizing costs are
		// well understood. Related to bundlesize minified, gzipped compressed file size tests.
		// Note: entrypoint size implicitly includes the mobile.startup.runtime and mobile.common
		// chunks.
		maxAssetSize: 47.0 * 1024,
		maxEntrypointSize: 59.6 * 1024,

		// The default filter excludes map files but we rename ours. Also, any modules prefixed with
		// "tests." are excluded from performance checks as they are not shipped to end users.
		assetFilter: ( filename ) => !filename.startsWith( 'tests.' ) &&
			!filename.endsWith( srcMapExt )
	}
};
