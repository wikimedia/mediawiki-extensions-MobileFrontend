( function ( M, mw, $ ) {

	var MobileViewBannerImageRepository = M.require( 'modules/bannerImage/MobileViewBannerImageRepository' ),
		Image = M.require( 'modules/bannerImage/Image' );

	QUnit.module( 'MobileFrontend modules/bannerImage/MobileViewBannerImageRepository', {
		setup: function () {
			var api = new mw.Api();
			this.getDeferred = $.Deferred();
			this.getSpy = this.stub( api, 'get' ).returns( this.getDeferred.promise() );
			this.title = 'Samurai';
			this.repository = new MobileViewBannerImageRepository( api, this.title );
		}
	} );

	QUnit.test( 'it should try to get the image at the target width', 1, function ( assert ) {
		this.repository.getImage( 1234 );

		assert.deepEqual( this.getSpy.lastCall.args[0], {
			action: 'mobileview',
			prop: 'thumb',
			page: this.title,
			thumbwidth: 1234
		} );
	} );

	QUnit.test( 'it should reject if the page doesn\'t exist', 1, function ( assert ) {
		var error = {
			code: 'missingtitle',
			info: 'The page you requested doesn\'t exist',
			'*': 'See https://en.wikipedia.org/w/api.php for API usage'
		};

		this.getDeferred.resolve( {
			error: error
		} );

		this.repository.getImage( 1234 ).fail( function ( actualError ) {
			assert.deepEqual( error, actualError );
		} );
	} );

	QUnit.test( 'it should reject if there\'s an error getting the image', 1, function ( assert ) {
		var error = 'ERR0R!!!';

		this.getDeferred.reject( error );

		this.repository.getImage( 1234 ).fail( function ( actualError ) {
			assert.deepEqual( error, actualError );
		} );
	} );

	QUnit.test( 'it should return the image if there is one', 1, function ( assert ) {
		this.getDeferred.resolve( {
			mobileview: {
				thumb: {
					url: 'http://foo/bar/baz',
					width: 1,
					height: 1
				},
				sections: []
			}
		} );

		this.repository.getImage( 1234 ).then( function ( image ) {
			assert.deepEqual( image, new Image( 'http://foo/bar/baz', 1, 1 ) );
		} );
	} );

	QUnit.test( 'it should reject if there isn\'t a thumbnail', 1, function ( assert ) {
		this.getDeferred.resolve( {
			mobileview: {
				sections: []
			}
		} );

		this.repository.getImage( 1234 ).fail( function () {
			assert.strictEqual( true, true );
		} );
	} );

	QUnit.test( 'it shouldn\'t try to get the image at the target width more than once', 1, function ( assert ) {
		this.getDeferred.resolve( {
			mobileview: {
				thumb: {
					url: 'http://foo/bar/baz',
					width: 1,
					height: 1
				},
				sections: []
			}
		} );

		this.repository.getImage( 1234 );
		this.repository.getImage( 1234 );

		assert.strictEqual( this.getSpy.callCount, 1 );
	} );

} ( mw.mobileFrontend, mw, jQuery ) );
