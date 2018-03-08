( function ( $, M ) {

	var ReferenceDrawer = M.require( 'mobile.references/ReferencesDrawer' ),
		ReferencesGateway = M.require( 'mobile.references.gateway/ReferencesGateway' ),
		Page = M.require( 'mobile.startup/Page' );

	QUnit.module( 'MobileFrontend: ReferencesDrawer', {
		setup: function () {
			this.gateway = {
				getReference: $.noop
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
			assert.ok( hideSpy.calledOnce, 'Hide is called.' );
		} );
	} );

	QUnit.test( 'Good reference causes render', function ( assert ) {
		var promise = $.Deferred().resolve( {
				text: 'I am a reference'
			} ).promise(),
			renderSpy = this.sandbox.spy( this.drawer, 'render' ),
			showSpy = this.sandbox.spy( this.drawer, 'show' );

		assert.expect( 2 );

		this.sandbox.stub( this.gateway, 'getReference' ).returns( promise );
		this.drawer.showReference( '#cite_note-good', this.page, '1' );

		return promise.then( function () {
			assert.ok( showSpy.calledOnce, 'Show is called.' );
			assert.ok( renderSpy.calledOnce, 'Render is called.' );
		} );
	} );

	QUnit.test( 'Reference failure renders error in drawer', function ( assert ) {
		var promise = $.Deferred().reject( ReferencesGateway.ERROR_OTHER ).promise(),
			renderSpy = this.sandbox.spy( this.drawer, 'render' ),
			showSpy = this.sandbox.spy( this.drawer, 'show' );

		assert.expect( 3 );

		this.sandbox.stub( this.gateway, 'getReference' ).returns( promise );
		this.drawer.showReference( '#cite_note-bad', this.page, '1' );

		return promise.catch( function () {
			assert.ok( showSpy.calledOnce, 'Show is called.' );
			assert.ok( renderSpy.calledOnce, 'Render is called.' );
			assert.ok( renderSpy.calledWith( {
				error: true,
				title: '1',
				text: mw.msg( 'mobile-frontend-references-citation-error' )
			} ), 'Render is called with the error parameter.' );
		} );
	} );

}( jQuery, mw.mobileFrontend ) );
