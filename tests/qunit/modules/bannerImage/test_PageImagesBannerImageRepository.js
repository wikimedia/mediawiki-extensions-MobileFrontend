( function ( M, mw, $ ) {

	var PageImagesBannerImageRepository = M.require( 'modules/bannerImage/PageImagesBannerImageRepository' ),
		Image = M.require( 'modules/bannerImage/Image' );

	QUnit.module( 'MobileFrontend modules/bannerImage/PageImagesBannerImageRepository', {
		setup: function () {
			var api = new mw.Api();
			this.getDeferred = $.Deferred();
			this.getSpy = this.stub( api, 'get' ).returns( this.getDeferred.promise() );
			this.title = 'Samurai';
			this.repository = new PageImagesBannerImageRepository( api, this.title );
		}
	} );

	QUnit.test( 'it should try to get the images at the target width', 1, function ( assert ) {
		this.repository.getImages( 1234 );

		assert.deepEqual( this.getSpy.lastCall.args[0], {
			prop: 'pageimages',
			titles: this.title,
			pithumbsize: 1234
		} );
	} );

	QUnit.test( 'it should resolve with an empty list if the page doesn\'t exist', 1, function ( assert ) {
		this.getDeferred.resolve( {
			query: {
				pages: {
					'-1': {}
				}
			}
		} );

		this.repository.getImages( 1234 ).then( function ( images ) {
			assert.deepEqual( images, [] );
		} );
	} );

	QUnit.test( 'it should reject if there\'s an error getting the images', 1, function ( assert ) {
		var error = 'ERR0R!!!';

		this.getDeferred.reject( error );

		this.repository.getImages( 1234 ).fail( function ( actualError ) {
			assert.deepEqual( error, actualError );
		} );
	} );

	QUnit.test( 'it should return a list of images if there are any', 1, function ( assert ) {
		this.getDeferred.resolve( {
			query: {
				pages: {
					1234: {
						thumbnail: {
							source: 'http://foo/bar/baz',
							width: 1,
							height: 1
						}
					}
				}
			}
		} );

		this.repository.getImages( 1234 ).then( function ( images ) {
			assert.deepEqual( images, [
				new Image( 'http://foo/bar/baz', 1, 1 )
			] );
		} );
	} );

	QUnit.test( 'it shouldn\'t return an image if there isn\'t a thumbnail', 1, function ( assert ) {
		this.getDeferred.resolve( {
			query: {
				pages: {
					1234: {}
				}
			}
		} );

		this.repository.getImages( 1234 ).then( function ( images ) {
			assert.deepEqual( images, [] );
		} );
	} );

	QUnit.test( 'it shouldn\'t try to get images at the target width more than once', 1, function ( assert ) {
		this.getDeferred.resolve( {
			query: {
				pages: {
					1234: {
						thumbnail: {
							source: 'http://foo/bar/baz',
							width: 1,
							height: 1
						}
					}
				}
			}
		} );

		this.repository.getImages( 1234 );
		this.repository.getImages( 1234 );

		assert.strictEqual( this.getSpy.callCount, 1 );
	} );

} ( mw.mobileFrontend, mw, jQuery ) );
