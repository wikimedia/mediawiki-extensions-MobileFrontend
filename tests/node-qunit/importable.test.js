// NOTE: Due to the use of dynamic imports this is not included in Special:JavaScript build
// This tests the importable nature of the MobileFrontend code library.
// It also ensures we add test coverage for files without any
// (loosely inspired by https://github.com/istanbuljs/nyc/issues/594)
// If a module cannot be tested with Node.js it needs to be added to .c8rc.json
let sandbox;
const fakeRouter = require( 'mediawiki.router' );
const path = require( 'path' ),
	config = require( '../../.c8rc.json' ),
	glob = require( 'glob' ),
	sinon = require( 'sinon' ),
	util = require( '../../resources/mobile.startup/util' ),
	dom = require( './utils/dom' ),
	jQuery = require( './utils/jQuery' ),
	oo = require( './utils/oo' ),
	mediawiki = require( './utils/mw' ),
	mustache = require( './utils/mustache' );

QUnit.module( 'MobileFrontend imports', {
	beforeEach: function () {
		sandbox = sinon.createSandbox();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		mediawiki.setUp( sandbox, global );
		mustache.setUp( sandbox, global );
		global.OO.ui = {
			TextInputWidget: () => {},
			Tool: function () {},
			mixin: {
				LookupElement: () => {}
			}
		};
		global.location = new URL( 'https://example.com' );
		fakeRouter.back = sandbox.spy();
		// Several modules load ext.eventLogging - we will simulate this failing.
		sandbox.stub( mw.loader, 'using' ).returns( util.Deferred().reject() );
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

// This test also has the useful side effect of making sure untested files
// show up in coverage reports.
QUnit.test( 'All our code is importable in headless Node.js', ( assert ) => {
	const
		errors = [],
		ignore = config.exclude;
	for ( const moduleFileName of config.include.flatMap( ( pattern ) => glob.sync( pattern, { ignore } ) ) ) {
		const importPath = path.resolve( __dirname, '../../', moduleFileName );
		try {
			require( importPath );
		} catch ( _e ) {
			errors.push( moduleFileName );
		}
	}
	assert.strictEqual( errors.length, 0,
		`There were no errors when importing any of the modules:\n\n${ errors.join( '\n' ) }` );
} );
