( function ( M, $ ) {

	var TalkSectionOverlay = M.require( 'mobile.talk.overlays/TalkSectionOverlay' ),
		user = M.require( 'mobile.user/user' ),
		renderFromApiSpy;

	QUnit.module( 'MobileFrontend TalkSectionOverlay - logged in', {
		setup: function () {
			this.api = new mw.Api();
			renderFromApiSpy = this.sandbox.stub( TalkSectionOverlay.prototype, 'renderFromApi' );
			this.sandbox.stub( user, 'isAnon' ).returns( false );
		}
	} );

	QUnit.test( 'Load section from api only, if needed', 2, function ( assert ) {
		var overlay = new TalkSectionOverlay( {
			api: this.api,
			section: 'Testtext'
		} );

		assert.strictEqual( renderFromApiSpy.callCount, 0, 'Section requested from api, if no section given.' );

		overlay = new TalkSectionOverlay( {
			api: this.api
		} );
		assert.ok( renderFromApiSpy.calledOnce, 'No Api request, if section given' );
	} );

	QUnit.test( 'Check comment box for logged in users', 1, function ( assert ) {
		var overlay = new TalkSectionOverlay( {
			api: this.api,
			section: 'Test'
		} );

		assert.ok( overlay.$( '.comment' ).length > 0, 'There is a visible comment box' );
	} );

	QUnit.test( 'Check error class on textarea', 2, function ( assert ) {
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

	QUnit.test( 'Check api request on save', 1, function ( assert ) {
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
			appendtext: '\n\nTestcomment ~~~~'
		} ), 'Save request passes!' );
	} );

	QUnit.module( 'MobileFrontend TalkSectionOverlay - anonymous (logged out)', {
		setup: function () {
			renderFromApiSpy = this.sandbox.stub( TalkSectionOverlay.prototype, 'renderFromApi' );
			this.sandbox.stub( user, 'isAnon' ).returns( false );
		}
	} );

	QUnit.test( 'Check comment box for logged out users', 1, function ( assert ) {
		var overlay = new TalkSectionOverlay( {
			api: new mw.Api(),
			section: 'Test'
		} );

		assert.ok( overlay.$( '.comment' ).length > 0, 'There is a visible comment box' );
	} );

}( mw.mobileFrontend, jQuery ) );
