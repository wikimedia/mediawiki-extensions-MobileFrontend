var referencesGatewayRejector, referencesGatewayEmpty, page, api, referencesGateway,
	sandbox, ReferencesMobileViewGateway, Page,
	sinon = require( 'sinon' ),
	ReferencesGateway = require( './../../../../src/mobile.startup/references/ReferencesGateway' ),
	util = require( '../../../../src/mobile.startup/util' ),
	mediaWiki = require( '../../utils/mw' ),
	oo = require( '../../utils/oo' ),
	jQuery = require( '../../utils/jQuery' ),
	dom = require( '../../utils/dom' ),
	lazyLoadedReferencesPage = require( '../../utils/PageInputs.html' ).lazyLoadedReferencesPage,
	cache = require( '../../../../src/mobile.startup/cache' ),
	MemoryCache = cache.MemoryCache;

QUnit.module( 'MobileFrontend ReferencesMobileViewGateway.test.js', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );
		ReferencesMobileViewGateway = require( './../../../../src/mobile.startup/references/ReferencesMobileViewGateway' );
		Page = require( '../../../../src/mobile.startup/Page' );

		page = new Page( {
			el: util.parseHTML( lazyLoadedReferencesPage ),
			title: 'Reftest'
		} );

		api = new mw.Api();
		sandbox.stub( api, 'get' ).returns(
			util.Deferred().resolve( {
				mobileview: {
					sections: []
				}
			} )
		);

		referencesGateway = new ReferencesMobileViewGateway( new mw.Api() );
		sandbox.stub( referencesGateway, 'getReferencesLists' ).returns(
			util.Deferred().resolve( {
				1: '<ol class="references"><li id="cite_note-1">real lazy</li>' +
					'<li id="cite_note-2">real lazy 2</li></ol>'
			} ).promise()
		);
		referencesGatewayEmpty = new ReferencesMobileViewGateway( new mw.Api() );
		sandbox.stub( referencesGatewayEmpty, 'getReferencesLists' ).returns(
			util.Deferred().resolve( {} ).promise()
		);
		referencesGatewayRejector = new ReferencesMobileViewGateway( new mw.Api() );
		sandbox.stub( referencesGatewayRejector, 'getReferencesLists' ).returns(
			util.Deferred().reject( ReferencesGateway.ERROR_OTHER ).promise()
		);
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( 'getReferencesLists() Gateway only hits api once despite multiple calls', function ( assert ) {
	var gatewayHitsApi = new ReferencesMobileViewGateway( api, new MemoryCache() );
	return gatewayHitsApi.getReferencesLists( page ).then( function () {
		gatewayHitsApi.getReferencesLists( page );
		gatewayHitsApi.getReferencesLists( page );
		assert.strictEqual( api.get.calledOnce, true, 'The API should only ever be hit once.' );
	} );
} );

QUnit.test( 'getReference() checking good reference', function ( assert ) {
	return referencesGateway.getReference( '#cite_note-1', page ).then( function ( ref ) {
		assert.strictEqual( ref.text, 'real lazy' );
	} );
} );

QUnit.test( 'getReference() checking good reference (subsequent calls)', function ( assert ) {
	return referencesGateway.getReference( '#cite_note-1', page ).then( function () {
		return referencesGateway.getReference( '#cite_note-2', page ).then( function ( ref ) {
			assert.strictEqual( ref.text, 'real lazy 2' );
		} );
	} );
} );

QUnit.test( 'getReference() checking bad reference', function ( assert ) {
	return referencesGateway.getReference( '#cite_note-bad', page ).catch( function ( err ) {
		assert.strictEqual( err, ReferencesGateway.ERROR_NOT_EXIST,
			'When reference not found error message reflects that.' );
	} );
} );

QUnit.test( 'getReference() checking reference on non-existent page', function ( assert ) {
	return referencesGatewayEmpty.getReference( '#cite_note-bad', page ).catch( function ( err ) {
		assert.strictEqual( err, ReferencesGateway.ERROR_NOT_EXIST,
			'When getReferencesElement returns empty list of elements reference is false.' );
	} );
} );

QUnit.test( 'getReference() checking reference when gateway rejects', function ( assert ) {
	return referencesGatewayRejector.getReference( '#cite_note-bad-2', page ).catch( function ( err ) {
		assert.strictEqual( err, ReferencesGateway.ERROR_OTHER, 'getReference is rejected if API query fails' );
	} );
} );
