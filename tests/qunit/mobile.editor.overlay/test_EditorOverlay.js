( function ( M, $ ) {
	var EditorGateway = M.require( 'mobile.editor.api/EditorGateway' ),
		EditorOverlay = M.require( 'mobile.editor.overlay/EditorOverlay' );

	QUnit.module( 'MobileFrontend mobile.editor.overlay/EditorOverlay', {
		setup: function () {
			var getContentStub;

			// prevent event logging requests
			this.sandbox.stub( EditorOverlay.prototype, 'log' ).returns( $.Deferred().resolve() );
			getContentStub = this.sandbox.stub( EditorGateway.prototype, 'getContent' );
			// the first call returns a getContent deferred for a blocked user.
			getContentStub.onCall( 0 ).returns( $.Deferred().resolve( 'section 0', {
					blockid: 1,
					blockedby: 'Test',
					blockreason: 'Testreason'
				} ) );
			// all other calls returns a deferred for unblocked users.
			getContentStub.returns( $.Deferred().resolve( 'section 0', {} ) );
			this.sandbox.stub( EditorGateway.prototype, 'getPreview' )
				.returns( $.Deferred().resolve( 'previewtest' ) );
		}
	} );

	// has to be the first test here! See comment in setup stub.
	QUnit.test( '#initialize, blocked user', 1, function ( assert ) {
		new EditorOverlay( {
			title: 'test.css'
		} );

		assert.strictEqual(
			$( '.mw-notification-content' ).text(),
			'Your IP address is blocked from editing. The block was made by Test for the following reason: Testreason.',
			'There is a toast notice, that i am blocked from editing'
		);
	} );

	QUnit.test( '#initialize, with given page and section', 5, function ( assert ) {
		var editorOverlay = new EditorOverlay( {
			title: 'test',
			sectionId: 0
		} );

		// The gateway is initialized with the correct properties,
		// particularly the correct section ID.
		assert.strictEqual( editorOverlay.gateway.title, 'test' );
		assert.strictEqual( editorOverlay.gateway.isNewPage, undefined );
		assert.strictEqual( editorOverlay.gateway.oldId, undefined );
		assert.strictEqual( editorOverlay.gateway.sectionId, 0 );

		assert.strictEqual( editorOverlay.$content.val(), 'section 0', 'load correct section' );
	} );

	QUnit.test( '#initialize, without a section', 4, function ( assert ) {
		var editorOverlay = new EditorOverlay( {
			title: 'test.css'
		} );

		assert.strictEqual( editorOverlay.gateway.title, 'test.css' );
		assert.strictEqual( editorOverlay.gateway.isNewPage, undefined );
		assert.strictEqual( editorOverlay.gateway.oldId, undefined );
		assert.strictEqual( editorOverlay.gateway.sectionId, undefined );
	} );

	QUnit.test( '#preview', 1, function ( assert ) {
		var editorOverlay = new EditorOverlay( {
			title: 'test',
			sectionId: 0
		} );

		editorOverlay.onStageChanges();
		assert.strictEqual( editorOverlay.$preview.text(), '\npreviewtest\n', 'preview loaded correctly' );
	} );

	QUnit.test( '#without-preview', 1, function ( assert ) {
		var editorOverlay;

		this.sandbox.stub( mw.config, 'get' ).withArgs( 'wgMFEditorOptions' ).returns( {
			skipPreview: true,
			anonymousEditing: true
		} );

		editorOverlay = new EditorOverlay( {
			title: 'test',
			sectionId: 0
		} );
		assert.strictEqual( editorOverlay.$( '.continue' ).text(), 'Save', 'no preview loaded' );
	} );

	QUnit.test( '#initialize, as anonymous', 2, function ( assert ) {
		var editorOverlay = new EditorOverlay( {
			title: 'Main_page',
			isAnon: true
		} );

		assert.ok( editorOverlay.$anonWarning.length > 0, 'Editorwarning (IP will be saved) visible.' );
		assert.ok( editorOverlay.$( '.anonymous' ).length > 0, 'Continue login has a second class.' );
	} );
}( mw.mobileFrontend, jQuery ) );
