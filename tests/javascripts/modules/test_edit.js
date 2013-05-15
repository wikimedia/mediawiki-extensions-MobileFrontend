( function ( M, $ ) {

	var module = M.require( 'modules/edit' ),
		EditApi = module._EditApi, EditOverlay = module._EditOverlay;

	QUnit.module( 'MobileFrontend modules/edit.EditOverlay', {
		setup: function() {
			sinon.stub( EditApi.prototype, 'getSection' ).
				withArgs( 0 ).returns( $.Deferred().resolve( { section: 0, content: 'section 0' } ) ).
				withArgs( 1 ).returns( $.Deferred().resolve( { section: 1, content: 'section 1' } ) ).
				withArgs( 2 ).returns( $.Deferred().resolve( { section: 2, content: 'section 2' } ) );
		},
		teardown: function() {
			EditApi.prototype.getSection.restore();
		}
	} );

	QUnit.test( '#initialize, with given page and section', 3, function( assert ) {
		var apiSpy = sinon.spy( EditApi.prototype, 'initialize' ),
			editOverlay = new EditOverlay( { pageId: 1, section: 0, sectionCount: 3 } );

		assert.ok( apiSpy.calledOnce, 'initialize EditApi once' );
		assert.ok( apiSpy.calledWith( { pageId: 1 } ), 'initialize EditApi with correct pageId' );
		assert.strictEqual( editOverlay.$content.val(), 'section 0', 'load correct section' );
	} );

	QUnit.test( '#initialize, Previous button', 3, function( assert ) {
		var editOverlay = new EditOverlay( { pageId: 1, section: 1, sectionCount: 3 } );

		editOverlay.$prev.click();
		assert.strictEqual( editOverlay.$content.val(), 'section 0', 'load previous section' );
		assert.ok( editOverlay.$prev.is( ':disabled' ), 'disable Previous on lead section' );
		editOverlay.$next.click();
		assert.ok( editOverlay.$prev.is( ':enabled' ), 'enable Previous on non-lead section' );
	} );

	QUnit.test( '#initialize, Next button', 3, function( assert ) {
		var editOverlay = new EditOverlay( { pageId: 1, section: 1, sectionCount: 3 } );

		editOverlay.$next.click();
		assert.strictEqual( editOverlay.$content.val(), 'section 2', 'load next section' );
		assert.ok( editOverlay.$next.is( ':disabled' ), 'disable Next on last section' );
		editOverlay.$prev.click();
		assert.ok( editOverlay.$next.is( ':enabled' ), 'enable Next on not last section' );
	} );
}( mw.mobileFrontend, jQuery ) );
