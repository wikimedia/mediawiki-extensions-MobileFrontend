let
	languageOverlay,
	LanguageSearcher,
	sandbox,
	spy;
const
	headless = typeof window !== 'object',
	m = require( '../../../../src/mobile.startup/moduleLoaderSingleton' ),
	util = require( '../../../../src/mobile.startup/util' ),
	jQuery = require( '../../utils/jQuery' ),
	dom = require( '../../utils/dom' ),
	oo = require( '../../utils/oo' ),
	mediaWiki = require( '../../utils/mw' ),
	mustache = require( '../../utils/mustache' ),
	sinon = require( 'sinon' );

QUnit.module( 'MobileFrontend languageOverlay.js', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );
		mustache.setUp( sandbox, global );

		LanguageSearcher = require( '../../../../src/mobile.languages.structured/LanguageSearcher' );
		languageOverlay = require( '../../../../src/mobile.startup/languageOverlay/languageOverlay' );

		sandbox.stub( mw.loader, 'using' ).withArgs( 'mobile.languages.structured' ).returns( util.Deferred().resolve() );

		// languageOverlay uses a global navigator so we need to stub it for headless tests
		if ( headless ) {
			// eslint-disable-next-line n/no-unsupported-features/node-builtins
			global.navigator = global.navigator || undefined;
			sandbox.stub( global, 'navigator' ).callsFake( () => {} );
		}

		spy = sandbox.stub( mw, 'hook' ).returns( { fire: function () {} } );
		sandbox.stub( m, 'require' ).withArgs( 'mobile.languages.structured/LanguageSearcher' ).returns( LanguageSearcher );
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( '#constructor', ( assert ) => {
	const
		gatewayDeferred = util.Deferred().resolve( {
			languages: [],
			variants: []
		} ),
		gateway = {
			getPageLanguages: function () {
				return gatewayDeferred;
			}
		},
		overlay = languageOverlay( gateway );

	assert.strictEqual( overlay.$el.find( '.overlay-content > .promised-view' ).text().trim(), 'mobile-frontend-loading-message', 'loading view rendered in .overlay-content' );

	return languageOverlay.test.loadLanguageSearcher( gateway ).then( () => {
		assert.strictEqual( overlay.$el.find( '.overlay-content > .promised-view' ).length, 0, 'promisedView has fulfilled its promise' );
		assert.strictEqual( overlay.$el.find( '.overlay-content > .language-searcher' ).length, 1, 'loaded view rendered in .overlay-content' );
		sinon.assert.calledWith( spy.withArgs( 'mobileFrontend.languageSearcher.onOpen' ) );
	} );
} );
