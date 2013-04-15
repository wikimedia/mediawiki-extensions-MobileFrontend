( function( M,  $ ) {

var api = M.require( 'api' );

// load page image for this article
api.get( {
	titles: mw.config.get( 'wgTitle' ),
	prop: 'pageimages',
	action: 'query',
	pithumbsize: 400
} ).done( function( resp ) {
	var pages = $.map( resp.query.pages, function( p ) {
		return p;
	} );
	$( '#cover-photo' ).css( {
		'background-image': 'url(' + pages[0].thumbnail.source + ')'
	} );
} );

}( mw.mobileFrontend, jQuery ) );
