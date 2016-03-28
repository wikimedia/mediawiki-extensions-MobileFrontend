( function ( $, M ) {

	var Watchstar = M.require( 'mobile.watchstar/Watchstar' ),
		CtaDrawer = M.require( 'mobile.drawers/CtaDrawer' ),
		toast = M.require( 'mobile.toast/toast' ),
		Icon = M.require( 'mobile.startup/Icon' ),
		watchIcon = new Icon( {
			name: 'watched'
		} ),
		user = M.require( 'mobile.user/user' ),
		Page = M.require( 'mobile.startup/Page' );

	QUnit.module( 'MobileFrontend: Watchstar.js Anon', {
		setup: function () {
			this.sandbox.stub( user, 'isAnon' ).returns( true );
			this.spy = this.sandbox.stub( CtaDrawer.prototype, 'show' );
		}
	} );

	QUnit.test( 'Anonymous user opens drawer', 1, function ( assert ) {
		var $el = $( '<div>' );

		new Watchstar( {
			api: new mw.Api(),
			el: $el,
			page: new Page( {
				id: 10
			} )
		} );
		$el.trigger( 'click' );

		// position-fixed class may not have loaded and without it the toast is not visible so use
		// a spy rather than directly testing toast element visibility
		assert.ok( this.spy.called, 'We checked if the drawer was visible before displaying it' );
	} );

	QUnit.module( 'MobileFrontend: Watchstar.js', {
		setup: function () {
			this.sandbox.stub( user, 'isAnon' ).returns( false );
			this.spy = this.sandbox.stub( mw.Api.prototype, 'postWithToken' )
				.returns( $.Deferred().resolve() );

			this.toastSpy = this.sandbox.spy( toast, 'show' );
		},
		teardown: function () {
			// Hide any existing toasts
			toast.hide();
		}
	} );

	QUnit.test( 'Logged in user watches article', 3, function ( assert ) {
		var
			w = new Watchstar( {
				api: new mw.Api(),
				isWatched: false,
				page: new Page( {
					id: 42
				} )
			} ),
			$el = w.$el;

		$el.trigger( 'click' );
		assert.ok( this.spy.calledWith( 'watch', {
			action: 'watch',
			pageids: 42
		} ), 'The watch happened' );
		assert.strictEqual( $el.hasClass( watchIcon.getGlyphClassName() ),
			true, 'After successful watch has watched class' );
		assert.ok( this.toastSpy.calledOnce, 'A toast is shown' );
	} );

	QUnit.test( 'Logged in user unwatches article', 2, function ( assert ) {
		var
			w = new Watchstar( {
				api: new mw.Api(),
				isWatched: true,
				page: new Page( {
					id: 42
				} )
			} ),
			$el = w.$el;

		$el.trigger( 'click' );
		assert.ok( this.spy.calledWith( 'watch', {
			action: 'watch',
			unwatch: true,
			pageids: 42
		} ), 'The watch happened' );
		assert.ok( this.toastSpy.calledOnce, 'A toast is shown' );
	} );

}( jQuery, mw.mobileFrontend ) );
