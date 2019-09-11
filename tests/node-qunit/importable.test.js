// NOTE: Due to the use of dynamic imports this is not included in Special:JavaScript build
// This tests the importable nature of the MobileFrontend code library.
// It also ensures we add test coverage for files without any
// (loosely inspired by https://github.com/istanbuljs/nyc/issues/594)
// If a module cannot be tested with Node.js it needs to be added to .nyrc.json
let sandbox;
const path = require( 'path' ),
	config = require( '../../.nycrc.json' ),
	glob = require( 'glob' ),
	sinon = require( 'sinon' ),
	util = require( '../../src/mobile.startup/util' ),
	dom = require( './utils/dom' ),
	jQuery = require( './utils/jQuery' ),
	oo = require( './utils/oo' ),
	mediawiki = require( './utils/mw' ),
	mustache = require( './utils/mustache' );

QUnit.module( 'MobileFrontend imports', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		mediawiki.setUp( sandbox, global );
		mustache.setUp( sandbox, global );
		global.OO.ui = {
			CategoryLookupInputWidget: () => {},
			TextInputWidget: () => {},
			Tool: () => {},
			mixin: {
				LookupElement: () => {}
			}
		};
		// FIXME: Belongs to mock mediawiki - remove when https://github.com/wikimedia/mw-node-qunit/pull/6
		global.mw.trackSubscribe = () => {};
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
	let errors = [];
	const includes = config.include.join( ',' ),
		ignore = config.exclude;
	for ( const moduleFileName of glob.sync( includes, { ignore } ) ) {
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
