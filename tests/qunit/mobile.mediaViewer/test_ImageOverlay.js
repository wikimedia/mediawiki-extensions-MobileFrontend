( function ( M, $ ) {
	var ImageOverlay = M.require( 'mobile.mediaViewer/ImageOverlay' ),
		image = {
			descriptionurl: 'https://commons.wikimedia.org/wiki/File:The_Montgomery,_San_Francisco.jpg',
			thumbheight: 1024,
			thumburl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/The_Montgomery%2C_San_Francisco.jpg/676px-The_Montgomery%2C_San_Francisco.jpg',
			thumbwidth: 676,
			url: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/The_Montgomery%2C_San_Francisco.jpg'
		};

	QUnit.module( 'MobileFrontend mobile.mediaViewer/ImageOverlay', {
		setup: function () {
			this.sandbox.stub( mw.Api.prototype, 'get' ).returns(
				$.Deferred().resolve( {
					query: {
						pages: [
							{
								imageinfo: [ image ]
							}
						]
					}
				} )
			);
		}
	} );

	QUnit.test( 'ImageOverlay', 1, function ( assert ) {
		var imageOverlay = new ImageOverlay( {
			api: new mw.Api(),
			title: decodeURIComponent( image.url ),
			caption: 'The Montgomery in 2012.'
		} );
		assert.equal( imageOverlay.$el.find( 'img' ).length, 1, 'Image is present.' );
	} );

}( mw.mobileFrontend, jQuery ) );
