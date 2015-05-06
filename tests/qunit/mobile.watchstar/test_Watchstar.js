( function ( $, M ) {

	var Watchstar = M.require( 'modules/watchstar/Watchstar' ),
		WatchstarApi = M.require( 'modules/watchstar/WatchstarApi' ),
		CtaDrawer = M.require( 'CtaDrawer' ),
		toast = M.require( 'toast' ),
		Icon = M.require( 'Icon' ),
		watchIcon = new Icon( {
			name: 'watched'
		} ),
		user = M.require( 'user' ),
		Page = M.require( 'Page' );

	QUnit.module( 'MobileFrontend: Watchstar.js Anon', {
		setup: function () {
			this.sandbox.stub( user, 'isAnon' ).returns( true );
			this.spy = this.sandbox.stub( CtaDrawer.prototype, 'show' );
		}
	} );

	QUnit.test( 'Anonymous user opens drawer', 1, function ( assert ) {
		var $el = $( '<div>' );

		new Watchstar( {
			el: $el,
			page: new Page( {
				id: 10
			} )
		} );
		$el.trigger( 'click' );

		// Note due to the fact isVisible uses a timeout we cannot easily test this
		assert.ok( this.spy.called, 'We checked if the drawer was visible before displaying it' );
	} );

	QUnit.module( 'MobileFrontend: Watchstar.js', {
		setup: function () {
			this.sandbox.stub( user, 'isAnon' ).returns( false );
			this.spy = this.sandbox.stub( WatchstarApi.prototype, 'postWithToken' )
				.returns( $.Deferred().resolve() );
		},
		teardown: function () {
			// Hide any existing toasts
			toast.hide();
		}
	} );

	QUnit.test( 'Logged in user watches article', 3, function ( assert ) {
		var
			w = new Watchstar( {
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
		assert.strictEqual( $( '.toast' ).is( ':visible' ), true, 'A toast is shown' );
	} );

	QUnit.test( 'Logged in user unwatches article', 2, function ( assert ) {
		var
			w = new Watchstar( {
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
		assert.strictEqual( $( '.toast' ).is( ':visible' ), true, 'A toast is shown' );
	} );

}( jQuery, mw.mobileFrontend ) );
