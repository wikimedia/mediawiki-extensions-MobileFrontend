( function ( M, $ ) {
	var EditorGateway = M.require( 'mobile.editor.api/EditorGateway' ),
		EditorOverlay = M.require( 'mobile.editor.overlay/EditorOverlay' ),
		BlockMessage = M.require( 'mobile.editor.overlay/BlockMessage' );

	QUnit.module( 'MobileFrontend mobile.editor.overlay/EditorOverlay', {
		beforeEach: function () {
			// prevent event logging requests
			this.sandbox.stub( EditorOverlay.prototype, 'log' ).returns( $.Deferred().resolve() );
			this.messageStub = this.sandbox.stub( BlockMessage.prototype, 'initialize' );
			this.sandbox.stub( BlockMessage.prototype, 'toggle' );
			this.getContentStub = this.sandbox.stub( EditorGateway.prototype, 'getContent' );
			// avoid waiting to load 'moment',
			// using `expiry: 'infinity'` below ensures we don't need it
			this.sandbox.stub( mw.loader, 'using' ).returns( { then: function ( callback ) {
				callback();
			} } );
			this.getContentStub.returns( $.Deferred().resolve( {
				text: 'section 0',
				user: {
					id: 1,
					name: 'Foo'
				},
				block: null,
				blockedByUser: null
			} ) );
			this.previewResolve = $.Deferred().resolve( { text: 'previewtest' } );
			this.sandbox.stub( EditorGateway.prototype, 'getPreview' )
				.returns( this.previewResolve );
		}
	} );

	QUnit.test( '#initialize, blocked user', function ( assert ) {
		var messageStub = this.messageStub,
			dBlockedContent = $.Deferred().resolve( {
				text: 'section 0',
				user: {
					blockid: 1
				},
				block: {
					by: 'Test',
					expiry: 'infinity',
					reason: 'Testreason'
				},
				blockedByUser: {
					gender: 'female'
				}
			} );
		this.getContentStub.returns( dBlockedContent );
		// eslint-disable-next-line no-new
		new EditorOverlay( {
			title: 'test.css'
		} );

		return dBlockedContent.then( function () {
			assert.ok(
				messageStub.calledWith( {
					creator: {
						name: 'Test',
						url: mw.util.getUrl( 'User:Test' ),
						gender: 'female'
					},
					expiry: null,
					duration: null,
					reason: 'Testreason'
				} ),
				'There is a drawer notice, that i am blocked from editing'
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

		return this.getContentStub().then( function () {
			assert.strictEqual( editorOverlay.$content.val(), 'section 0', 'load correct section' );
		} );
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

		return this.previewResolve.then( function () {
			assert.strictEqual( editorOverlay.$preview.text(), '\npreviewtest\n', 'preview loaded correctly' );
		} );
	} );

	QUnit.test( '#without-preview', function ( assert ) {
		var editorOverlay;

		this.sandbox.stub( mw.config, 'get', function ( key ) {
			if ( key === 'wgMFEditorOptions' ) {
				return {
					skipPreview: true
				};
			} else {
				return mw.config.values[ key ];
			}
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
