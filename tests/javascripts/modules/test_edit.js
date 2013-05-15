( function ( M, $ ) {

	var module = M.require( 'modules/edit' ),
		EditApi = module._EditApi, EditOverlay = module._EditOverlay;

	QUnit.module( 'MobileFrontend modules/edit' );

	QUnit.test( 'EditOverlay, initialize with given page and section', 3, function( assert ) {
		var editOverlay, apiSpy = sinon.spy( EditApi.prototype, 'initialize' );

		sinon.stub( EditApi.prototype, 'getSection' ).withArgs( 0 ).returns(
			$.Deferred().resolve( 'test wikitext' )
		);
		editOverlay = new EditOverlay( { pageId: 1, section: 0 } );

		assert.ok( apiSpy.calledOnce, 'initialize EditApi once' );
		assert.ok( apiSpy.calledWith( { pageId: 1 } ), 'initialize EditApi with correct pageId' );
		assert.strictEqual( editOverlay.$( 'textarea' ).val(), 'test wikitext' );
	} );
}( mw.mobileFrontend, jQuery ) );
