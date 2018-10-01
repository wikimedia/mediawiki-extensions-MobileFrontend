( function ( $, M ) {

	var ReferenceDrawer = M.require( 'mobile.references/ReferencesDrawer' ),
		ReferencesGateway = M.require( 'mobile.references.gateway/ReferencesGateway' ),
		Page = M.require( 'mobile.startup/Page' );

	QUnit.module( 'MobileFrontend: ReferencesDrawer', {
		beforeEach: function () {
			this.gateway = {
				getReference: function () {}
			};
			this.page = new Page( { title: 'reference test' } );
			this.drawer = new ReferenceDrawer( {
				page: this.page,
				gateway: this.gateway
			} );
		}
	} );

	QUnit.test( 'Bad reference not shown', function ( assert ) {
		var promise = $.Deferred().reject( ReferencesGateway.ERROR_NOT_EXIST ).promise(),
			hideSpy = this.sandbox.spy( this.drawer, 'hide' );

		this.sandbox.stub( this.gateway, 'getReference' ).returns( promise );
		this.drawer.showReference( '#cite_note-bad', this.page, '1' );

		return promise.catch( function () {
			assert.strictEqual( hideSpy.callCount, 1, 'Hide is called.' );
		} );
	} );

	QUnit.test( 'Good reference causes render', function ( assert ) {
		var promise = $.Deferred().resolve( {
				text: 'I am a reference'
			} ).promise(),
			renderSpy = this.sandbox.spy( this.drawer, 'render' ),
			showSpy = this.sandbox.spy( this.drawer, 'show' ),
			done = assert.async();

		this.sandbox.stub( this.gateway, 'getReference' ).returns( promise );
		this.drawer.showReference( '#cite_note-good', this.page, '1' );

		return promise.then( function () {
			assert.strictEqual( showSpy.callCount, 1, 'Show is called.' );
			assert.strictEqual( renderSpy.callCount, 1, 'Render is called.' );
			done();
		} );
	} );

	QUnit.test( 'Reference failure renders error in drawer', function ( assert ) {
		var promise = $.Deferred().reject( ReferencesGateway.ERROR_OTHER ).promise(),
			renderSpy = this.sandbox.spy( this.drawer, 'render' ),
			showSpy = this.sandbox.spy( this.drawer, 'show' ),
			done = assert.async();

		this.sandbox.stub( this.gateway, 'getReference' ).returns( promise );
		this.drawer.showReference( '#cite_note-bad', this.page, '1' );

		return promise.catch( function () {
			assert.strictEqual( showSpy.callCount, 1, 'Show is called.' );
			assert.strictEqual( renderSpy.callCount, 1, 'Render is called.' );
			assert.ok( renderSpy.calledWith( {
				error: true,
				title: '1',
				text: mw.msg( 'mobile-frontend-references-citation-error' )
			} ), 'Render is called with the error parameter.' );
			done();
		} );
	} );

}( jQuery, mw.mobileFrontend ) );
