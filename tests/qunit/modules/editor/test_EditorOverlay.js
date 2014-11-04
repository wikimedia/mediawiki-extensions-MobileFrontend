( function ( M, $ ) {

	var EditorApi = M.require( 'modules/editor/EditorApi' ),
		EditorOverlay = M.require( 'modules/editor/EditorOverlay' ),
		apiSpy;

	QUnit.module( 'MobileFrontend modules/editor/EditorOverlay', {
		setup: function() {
			apiSpy = this.sandbox.spy( EditorApi.prototype, 'initialize' );

			// prevent event logging requests
			this.sandbox.stub( EditorOverlay.prototype, 'log' ).returns( $.Deferred().resolve() );
			this.sandbox.stub( EditorApi.prototype, 'getContent' )
				.returns( $.Deferred().resolve( 'section 0' ) );
			this.sandbox.stub( EditorApi.prototype, 'getPreview' )
				.returns( $.Deferred().resolve( 'previewtest' ) );
		}
	} );

	QUnit.test( '#initialize, with given page and section', 3, function( assert ) {
		var editorOverlay = new EditorOverlay( { title: 'test', sectionId: 0 } );

		assert.ok( apiSpy.calledOnce, 'initialize EditorApi once' );
		assert.ok( apiSpy.calledWithMatch( { title: 'test', isNewPage: undefined, oldId: undefined, sectionId: 0} ), 'initialize EditorApi with correct pageTitle' );
		assert.strictEqual( editorOverlay.$content.val(), 'section 0', 'load correct section' );
	} );

	QUnit.test( '#preview', 1, function( assert ) {
		var editorOverlay = new EditorOverlay( { title: 'test', sectionId: 0 } );

		editorOverlay._prepareForSave();
		assert.strictEqual( editorOverlay.$preview.text(), '\npreviewtest\n', 'preview loaded correctly' );
	} );

	QUnit.test( '#initialize, without a section', 2, function( assert ) {
		new EditorOverlay( { title: 'test.css' } );

		assert.ok( apiSpy.calledOnce, 'initialize EditorApi once' );
		assert.ok( apiSpy.calledWithMatch( { title: 'test.css', isNewPage: undefined, oldId: undefined, sectionId: undefined } ), 'initialize EditorApi without a section' );
	} );

	QUnit.test( '#initialize, as anonymous', 1, function( assert ) {
		var editorOverlay = new EditorOverlay( { title: 'Main_page', isAnon: true } );

		assert.ok( editorOverlay.$anonWarning.length > 0, 'Editorwarning (IP will be saved) visible.' );
	} );
}( mw.mobileFrontend, jQuery ) );
