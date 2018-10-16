var
	headless = typeof window !== 'object',
	hogan = require( 'hogan.js' ),
	path = require( 'path' ),
	fs = require( 'fs' ),
	compilers;

compilers = {
	html: function ( str ) {
		return {
			render: function () {
				return str;
			}
		};
	},
	hogan: function ( str ) {
		return hogan.compile( str );
	}
};

module.exports = {
	/**
	 * Utility function intended to be used in the test environment to get the
	 * contents of template files. This occurs in at least two common scenarios
	 * which motivated the creation of this utility:
	 *
	 * 1) Tests need to import the contents of templates.
	 * e.g. line 82 https://gerrit.wikimedia.org/r/#/c/mediawiki/extensions/MobileFrontend/+/466667/7/tests/node-qunit/mobile.startup/Skin.test.js
	 *
	 * Under this scenario, the test can call
	 * ```
	 * require( 'templateReader' ).get( 'tests/qunit/tests.mobilefrontend/foo.hogan' )
	 * .render( { data: 'foo' } );
	 * ```
	 * and get back a string to use in the test.
	 *
	 * 2) Tests rely on production code (non-test code) that use mw.template.get
	 * (e.g. Overlay.js). Given that the global mediawiki client is not available
	 * in headless qunit mode, one approach to address this problem could be to
	 * add template.get to mockMediaWiki.js and make it delegate to this utility
	 * function.
	 *
	 * ```
	 * // mockMediaWiki.js
	 * {
	 *   template: {
	 *     get: function ( moduleName, templateName ) {
	 *       var
	 *         resourceModules = require( '../extension.json' ).ResourceModules,
	 *         templatePath = resourceModules[ moduleName ].templates[ templateName ];
	 *
	 *       return require( 'templateReader' ).get( templatePath );
	 *     }
	 *   }
	 * }
	 * ```
	 *
	 * In both of these scenarios, we need a way to get the contents of template
	 * files and have it work in both browser qunit and headless qunit test modes.
	 *
	 * This utility tries to address the above problem by getting a compiled
	 * template by project root path. In browser qunit mode, it assumes that the
	 * name of the directory containing the template is the same as the module
	 * name and delegates to mw.template.get with the module name and template
	 * name. In headless qunit mode, it uses fs.readFileSync to get the contents
	 * of the file and runs the appropriate compiler based on the extension of the
	 * file.
	 *
	 * @param {string} filePath template path relative to project's root directory
	 * e.g. 'tests/qunit/tests.mobilefrontend/skinPage.html'
	 * @return {Object} Compiled template
	 */
	get: function ( filePath ) {
		var
			segments,
			moduleName,
			templateName,
			rootPath,
			extension,
			templateString;

		if ( !headless ) {
			// Assume template is inside a directory with same name as resource module
			segments = filePath.split( '/' );
			moduleName = segments[ segments.length - 2 ];
			templateName = segments[ segments.length - 1 ];

			return mw.template.get( moduleName, templateName );
		}

		extension = path.extname( filePath ).split( '.' ).pop();

		if ( !compilers[ extension ] ) {
			throw new Error( 'Template compiler not found for extension \'' + extension + '\'.' +
				' Please add one to templateReader.js' );
		}

		rootPath = path.resolve( __dirname, '../../../' );
		templateString = fs.readFileSync( path.join( rootPath, filePath ), 'utf8' );

		return compilers[ extension ]( templateString );
	}
};
