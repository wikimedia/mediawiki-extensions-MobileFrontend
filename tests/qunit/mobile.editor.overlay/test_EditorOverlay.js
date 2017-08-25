( function ( M, $ ) {
	var EditorGateway = M.require( 'mobile.editor.api/EditorGateway' ),
		EditorOverlay = M.require( 'mobile.editor.overlay/EditorOverlay' );

	QUnit.module( 'MobileFrontend mobile.editor.overlay/EditorOverlay', {
		setup: function () {
			var getContentStub;

			// prevent event logging requests
			this.sandbox.stub( EditorOverlay.prototype, 'log' ).returns( $.Deferred().resolve() );
			this.toastStub = this.sandbox.stub( mw, 'notify' );
			getContentStub = this.sandbox.stub( EditorGateway.prototype, 'getContent' );
			// the first call returns a getContent deferred for a blocked user.
			this.dBlockedContent = $.Deferred().resolve( {
				text: 'section 0',
				user: {
					blockid: 1,
					blockedby: 'Test',
					blockreason: 'Testreason'
				}
			} );
			getContentStub.onCall( 0 ).returns( this.dBlockedContent );
			// all other calls returns a deferred for unblocked users.
			getContentStub.returns( $.Deferred().resolve( 'section 0', {} ) );
			this.sandbox.stub( EditorGateway.prototype, 'getPreview' )
				.returns( $.Deferred().resolve( { text: 'previewtest' } ) );
		}
	} );

	// has to be the first test here! See comment in setup stub.
	QUnit.test( '#initialize, blocked user', function ( assert ) {
		var toastStub = this.toastStub;
		// eslint-disable-next-line no-new
		new EditorOverlay( {
			title: 'test.css'
		} );

		return this.dBlockedContent.then( function () {
			assert.ok(
				toastStub.calledWith(
					'Your IP address is blocked from editing. The block was made by Test for the following reason: Testreason.'
				),
				'There is a toast notice, that i am blocked from editing'
			);
		} );
	} );

	QUnit.test( '#initialize, with given page and section', function ( assert ) {
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

	QUnit.test( '#initialize, without a section', function ( assert ) {
		var editorOverlay = new EditorOverlay( {
			title: 'test.css'
		} );

		assert.strictEqual( editorOverlay.gateway.title, 'test.css' );
		assert.strictEqual( editorOverlay.gateway.isNewPage, undefined );
		assert.strictEqual( editorOverlay.gateway.oldId, undefined );
		assert.strictEqual( editorOverlay.gateway.sectionId, undefined );
	} );

	QUnit.test( '#preview', function ( assert ) {
		var editorOverlay = new EditorOverlay( {
			title: 'test',
			sectionId: 0
		} );

		editorOverlay.onStageChanges();
		assert.strictEqual( editorOverlay.$preview.text(), '\npreviewtest\n', 'preview loaded correctly' );
	} );

	QUnit.test( '#without-preview', function ( assert ) {
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

	QUnit.test( '#initialize, as anonymous', function ( assert ) {
		var editorOverlay = new EditorOverlay( {
			title: 'Main_page',
			isAnon: true
		} );

		assert.ok( editorOverlay.$anonWarning.length > 0, 'Editorwarning (IP will be saved) visible.' );
		assert.ok( editorOverlay.$( '.anonymous' ).length > 0, 'Continue login has a second class.' );
	} );
}( mw.mobileFrontend, jQuery ) );
