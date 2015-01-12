( function ( $, M ) {

	var photo = M.require( 'modules/uploads/_leadphoto' ),
		_wgMFLeadPhotoUploadCssSelector,
		articles = [
			// blank #content_0
			[ $( '<div><div id="content_0"></div></div>' ), true ],
			// infobox in #content_1
			[ $( '<div><div id="content_1"><table class="infobox"></div>' ), false ],
			// infobox in #content_0
			[ $( '<div><div id="content_0"><table class="infobox"></div></div>' ), false ],
			// navbox in #content_0
			[ $( '<div><table class="navbox"></table></div>' ), false ],
			// navbox in #content_0
			[ $( '<div><div id="content_0"><table class="navbox"></div></div>' ), false ],
			// thumbnail in #content_0
			[ $( '<div><div id="content_0"><div class="thumb"><img></div></div></div>' ), false ],
			// no #content_0 and no thumbnail, infobox or navbox
			[ $( '<div><p></p><div>' ), true ],
			// no #content_0 and a thumbnail
			[ $( '<div><div class="thumb"><img></div><div>' ), false ],
			// no #content_0 and an infobox
			[ $( '<div><table class="infobox"><div>' ), false ],
			// no #content_0 and a navbox
			[ $( '<div><table class="navbox"><div>' ), false ],
			// no #content_0, image not in .thumb (happens on main pages)
			[ $( '<div><img><div>' ), false ]
		];

	QUnit.module( 'MobileFrontend photo', {
		setup: function () {
			_wgMFLeadPhotoUploadCssSelector = mw.config.get( 'wgMFLeadPhotoUploadCssSelector' );
			mw.config.set( 'wgMFLeadPhotoUploadCssSelector', 'img, .navbox, .infobox' );
		},
		teardown: function () {
			mw.config.set( 'wgMFLeadPhotoUploadCssSelector', _wgMFLeadPhotoUploadCssSelector );
		}
	} );

	QUnit.test( '#needsPhoto', function ( assert ) {
		QUnit.expect( articles.length );
		var i;
		for ( i = 0; i < articles.length; i++ ) {
			assert.strictEqual( photo.needsPhoto( articles[ i ][ 0 ] ), articles[ i ][ 1 ], 'article ' + i );
		}
	} );

}( jQuery, mw.mobileFrontend ) );
