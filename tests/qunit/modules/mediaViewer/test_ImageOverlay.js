( function ( M, $ ) {
	var ImageApi = M.require( 'modules/mediaViewer/ImageApi' ),
		ImageOverlay = M.require( 'modules/mediaViewer/ImageOverlay' ),
		image = {
			descriptionurl: 'https://commons.wikimedia.org/wiki/File:The_Montgomery,_San_Francisco.jpg',
			thumbheight: 1024,
			thumburl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/The_Montgomery%2C_San_Francisco.jpg/676px-The_Montgomery%2C_San_Francisco.jpg',
			thumbwidth: 676,
			url: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/The_Montgomery%2C_San_Francisco.jpg'
		};

	QUnit.module( 'MobileFrontend modules/mediaViewer/ImageOverlay', {
		setup: function () {
			this.sandbox.stub( ImageApi.prototype, 'getThumb' ).returns(
				$.Deferred().resolve( image ) );
		}
	} );

	QUnit.test( 'ImageOverlay', 1, function ( assert ) {
		var imageOverlay = new ImageOverlay( {
			title: decodeURIComponent( image.url ),
			caption: 'The Montgomery in 2012.'
		} );
		assert.equal( imageOverlay.$el.find( 'img' ).length, 1, 'Image is present.' );
	} );

}( mw.mobileFrontend, jQuery ) );
