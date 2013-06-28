( function ( M, $ ) {

	var EditorApi = M.require( 'modules/editor/EditorApi' ),
		EditorOverlay = M.require( 'modules/editor/EditorOverlay' );

	QUnit.module( 'MobileFrontend modules/editor/EditorOverlay', {
		setup: function() {
			sinon.stub( EditorApi.prototype, 'getSection' ).
				withArgs( 0 ).returns( $.Deferred().resolve( { id: 0, content: 'section 0' } ) ).
				withArgs( 1 ).returns( $.Deferred().resolve( { id: 1, content: 'section 1' } ) ).
				withArgs( 2 ).returns( $.Deferred().resolve( { id: 2, content: 'section 2' } ) );
		},
		teardown: function() {
			EditorApi.prototype.getSection.restore();
		}
	} );

	QUnit.test( '#initialize, with given page and section', 3, function( assert ) {
		var apiSpy = sinon.spy( EditorApi.prototype, 'initialize' ),
			editorOverlay = new EditorOverlay( { title: 'test', section: 0, sectionCount: 3 } );

		assert.ok( apiSpy.calledOnce, 'initialize EditorApi once' );
		assert.ok( apiSpy.calledWith( { title: 'test', isNew: undefined } ), 'initialize EditorApi with correct pageTitle' );
		assert.strictEqual( editorOverlay.$content.val(), 'section 0', 'load correct section' );
	} );

}( mw.mobileFrontend, jQuery ) );
