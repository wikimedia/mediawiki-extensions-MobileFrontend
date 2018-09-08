( function ( $, M ) {

	var Watchstar = M.require( 'mobile.watchstar/Watchstar' ),
		CtaDrawer = M.require( 'mobile.startup/CtaDrawer' ),
		toast = M.require( 'mobile.startup/toast' ),
		Icon = M.require( 'mobile.startup/Icon' ),
		watchIcon = new Icon( {
			name: 'watched'
		} ),
		user = M.require( 'mobile.startup/user' ),
		Page = M.require( 'mobile.startup/Page' );

	QUnit.module( 'MobileFrontend: Watchstar.js Anon', {
		beforeEach: function () {
			this.sandbox.stub( user, 'isAnon' ).returns( true );
			this.spy = this.sandbox.stub( CtaDrawer.prototype, 'show' );
		}
	} );

	QUnit.test( 'Anonymous user opens drawer', function ( assert ) {
		var $el = $( '<div>' );

		// eslint-disable-next-line no-new
		new Watchstar( {
			api: new mw.Api(),
			el: $el,
			page: new Page( { title: 'Title' } )
		} );
		$el.trigger( 'click' );

		// position-fixed class may not have loaded and without it the toast is not visible so use
		// a spy rather than directly testing toast element visibility
		assert.ok( this.spy.called, 'We checked if the drawer was visible before displaying it' );
	} );

	QUnit.module( 'MobileFrontend: Watchstar.js', {
		beforeEach: function () {
			// Avoid unnecessary mw.notify animations
			this.toastStub = this.sandbox.stub( mw, 'notify' );
			this.sandbox.stub( user, 'isAnon' ).returns( false );
			this.postWithTokenDeferred = $.Deferred().resolve();
			this.spy = this.sandbox.stub( mw.Api.prototype, 'postWithToken' )
				.returns( this.postWithTokenDeferred );

			this.toastSpy = this.sandbox.spy( toast, 'show' );
		},
		afterEach: function () {
			// Hide any existing toasts
			toast.hide();
		}
	} );

	QUnit.test( 'Logged in user watches article', function ( assert ) {
		var
			w = new Watchstar( {
				api: new mw.Api(),
				isWatched: false,
				page: new Page( { title: 'Title' } )
			} ),
			$el = w.$el,
			self = this;

		$el.trigger( 'click' );

		return this.postWithTokenDeferred.then( function () {
			assert.ok( self.spy.calledWith( 'watch', {
				action: 'watch',
				titles: [ 'Title' ]
			} ), 'The watch happened' );
			assert.strictEqual( $el.hasClass( watchIcon.getGlyphClassName() ),
				true, 'After successful watch has watched class' );
			assert.strictEqual( self.toastSpy.callCount, 1, 'A toast is shown' );
		} );
	} );

	QUnit.test( 'Logged in user unwatches article', function ( assert ) {
		var
			w = new Watchstar( {
				api: new mw.Api(),
				isWatched: true,
				page: new Page( { title: 'Title' } )
			} ),
			$el = w.$el,
			self = this;

		$el.trigger( 'click' );

		return this.postWithTokenDeferred.then( function () {
			assert.ok( self.spy.calledWith( 'watch', {
				action: 'watch',
				unwatch: true,
				titles: [ 'Title' ]
			} ), 'The watch happened' );
			assert.strictEqual( self.toastSpy.callCount, 1, 'A toast is shown' );
		} );
	} );

}( jQuery, mw.mobileFrontend ) );
