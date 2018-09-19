( function ( M, $ ) {

	var TalkSectionOverlay = M.require( 'mobile.talk.overlays/TalkSectionOverlay' ),
		user = M.require( 'mobile.startup/user' ),
		renderFromApiSpy;

	QUnit.module( 'MobileFrontend TalkSectionOverlay - logged in', {
		beforeEach: function () {
			// don't create toasts in test environment
			this.toastStub = this.sandbox.stub( mw, 'notify' );
			this.api = new mw.Api();
			renderFromApiSpy = this.sandbox.stub( TalkSectionOverlay.prototype, 'renderFromApi' );
			this.sandbox.stub( user, 'isAnon' ).returns( false );
		}
	} );

	QUnit.test( 'Load section from api only, if needed', function ( assert ) {
		// eslint-disable-next-line no-new
		new TalkSectionOverlay( {
			api: this.api,
			section: 'Testtext'
		} );

		assert.strictEqual( renderFromApiSpy.callCount, 0, 'Section requested from api, if no section given.' );

		// eslint-disable-next-line no-new
		new TalkSectionOverlay( {
			api: this.api
		} );
		assert.strictEqual( renderFromApiSpy.callCount, 1, 'No Api request, if section given' );
	} );

	QUnit.test( 'Check comment box for logged in users', function ( assert ) {
		var overlay = new TalkSectionOverlay( {
			api: this.api,
			section: 'Test'
		} );

		assert.ok( overlay.$( '.comment' ).length > 0, 'There is a visible comment box' );
	} );

	QUnit.test( 'Check error class on textarea', function ( assert ) {
		var overlay;

		overlay = new TalkSectionOverlay( {
			api: this.api,
			section: 'Test'
		} );

		// add error class
		overlay.onSaveClick();
		assert.ok( overlay.$textarea.hasClass( 'error' ), 'Error class added when try to submit empty comment box.' );
		overlay.onFocusTextarea();
		assert.strictEqual( overlay.$textarea.hasClass( 'error' ), false, 'Error class removed after comment box get focus.' );
	} );

	QUnit.test( 'Check api request on save', function ( assert ) {
		var spy = this.sandbox.stub( mw.Api.prototype, 'postWithToken' ).returns( $.Deferred().resolve() ),
			overlay = new TalkSectionOverlay( {
				api: this.api,
				title: 'Talk:Test',
				id: 1,
				section: 'Test'
			} );

		overlay.$textarea.val( 'Testcomment' );
		overlay.onSaveClick();
		assert.ok( spy.calledWith( 'edit', {
			action: 'edit',
			title: 'Talk:Test',
			section: 1,
			appendtext: '\n\nTestcomment ~~~~',
			redirect: true
		} ), 'Save request passes!' );
	} );

	QUnit.module( 'MobileFrontend TalkSectionOverlay - anonymous (logged out)', {
		beforeEach: function () {
			renderFromApiSpy = this.sandbox.stub( TalkSectionOverlay.prototype, 'renderFromApi' );
			this.sandbox.stub( user, 'isAnon' ).returns( false );
		}
	} );

	QUnit.test( 'Check comment box for logged out users', function ( assert ) {
		var overlay = new TalkSectionOverlay( {
			api: new mw.Api(),
			section: 'Test'
		} );

		assert.ok( overlay.$( '.comment' ).length > 0, 'There is a visible comment box' );
	} );

}( mw.mobileFrontend, jQuery ) );
