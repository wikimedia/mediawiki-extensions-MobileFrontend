( function ( $, M ) {

	var ReferencesMobileViewGateway = M.require(
			'mobile.references.gateway/ReferencesMobileViewGateway'
		),
		ReferencesGateway = M.require( 'mobile.references.gateway/ReferencesGateway' ),
		Page = M.require( 'mobile.startup/Page' ),
		cache = M.require( 'mobile.startup/cache' ),
		MemoryCache = cache.MemoryCache;

	QUnit.module( 'MobileFrontend: mobileView references gateway', {
		beforeEach: function () {
			this.$container = mw.template.get( 'tests.mobilefrontend', 'pageWithStrippedRefs.html' )
				.render().appendTo( '#qunit-fixture' );

			this.page = new Page( {
				el: this.$container,
				title: 'Reftest'
			} );

			this.api = new mw.Api();
			this.sandbox.stub( this.api, 'get' ).returns(
				$.Deferred().resolve( {
					mobileview: {
						sections: []
					}
				} )
			);

			this.referencesGateway = new ReferencesMobileViewGateway( new mw.Api() );
			// We use Page object which calls getUrl which uses config variables.
			this.sandbox.stub( mw.util, 'getUrl' ).returns( '/wiki/Reftest' );
			this.sandbox.stub( this.referencesGateway, 'getReferencesLists' ).returns(
				$.Deferred().resolve( {
					1: '<ol class="references"><li id="cite_note-1">real lazy</li>' +
						'<li id="cite_note-2">real lazy 2</li></ol>'
				} ).promise()
			);
			this.referencesGatewayEmpty = new ReferencesMobileViewGateway( new mw.Api() );
			this.sandbox.stub( this.referencesGatewayEmpty, 'getReferencesLists' ).returns(
				$.Deferred().resolve( {} ).promise()
			);
			this.referencesGatewayRejector = new ReferencesMobileViewGateway( new mw.Api() );
			this.sandbox.stub( this.referencesGatewayRejector, 'getReferencesLists' ).returns(
				$.Deferred().reject( ReferencesGateway.ERROR_OTHER ).promise()
			);
		}
	} );

	QUnit.test( 'Gateway only hits api once despite multiple calls', function ( assert ) {
		var gatewayHitsApi = new ReferencesMobileViewGateway( this.api, new MemoryCache() );
		return gatewayHitsApi.getReferencesLists( this.page ).then( function () {
			gatewayHitsApi.getReferencesLists( this.page );
			gatewayHitsApi.getReferencesLists( this.page );
			assert.strictEqual( this.api.get.calledOnce, true, 'The API should only ever be hit once.' );
		}.bind( this ) );
	} );

	QUnit.test( 'checking good reference', function ( assert ) {
		return this.referencesGateway.getReference( '#cite_note-1', this.page ).then( function ( ref ) {
			assert.strictEqual( ref.text, 'real lazy' );
		} );
	} );

	QUnit.test( 'checking good reference (subsequent calls)', function ( assert ) {
		var page = this.page,
			referencesGateway = this.referencesGateway;

		return referencesGateway.getReference( '#cite_note-1', page ).then( function () {
			return referencesGateway.getReference( '#cite_note-2', page ).then( function ( ref ) {
				assert.strictEqual( ref.text, 'real lazy 2' );
			} );
		} );
	} );

	QUnit.test( 'checking bad reference', function ( assert ) {
		return this.referencesGateway.getReference( '#cite_note-bad', this.page ).catch( function ( err ) {
			assert.strictEqual( err, ReferencesGateway.ERROR_NOT_EXIST,
				'When reference not found error message reflects that.' );
		} );
	} );

	QUnit.test( 'checking reference on non-existent page', function ( assert ) {
		return this.referencesGatewayEmpty.getReference( '#cite_note-bad', this.page ).catch( function ( err ) {
			assert.strictEqual( err, ReferencesGateway.ERROR_NOT_EXIST,
				'When getReferencesElement returns empty list of elements reference is false.' );
		} );
	} );

	QUnit.test( 'checking reference when gateway rejects', function ( assert ) {
		return this.referencesGatewayRejector.getReference( '#cite_note-bad-2', this.page ).catch( function ( err ) {
			assert.strictEqual( err, ReferencesGateway.ERROR_OTHER, 'getReference is rejected if API query fails' );
		} );
	} );
}( jQuery, mw.mobileFrontend ) );
