( function( nav, $ ) {

module( 'MobileFrontend: mf-navigation.js', {} );

test( 'Simple overlay', function() {
	var overlay = new nav.Overlay( { heading: '<h2>Title</h2>', content: 'Text' } );
	overlay.open();
	strictEqual( overlay.$el[0].parentNode, document.body, 'In DOM' );
	strictEqual( overlay.$el.html(), '<h2>Title</h2>/Text' );
} );

test( 'HTML overlay', function() {
	var overlay = new nav.Overlay( {
		heading: '<div>Awesome: <input></div>',
		content: '<div class="content">YO</div>'
	} );
	strictEqual( overlay.$el.html(), '<div>Awesome: <input></div>/<div class="content">YO</div>' );
} );

test( 'Close overlay', function() {
	var overlay = new nav.Overlay( { heading: '<h2>Title</h2>', content: 'Text' } );
	overlay.open();
	overlay.close();
	strictEqual( overlay.$el[0].parentNode, null, 'No longer in DOM' );
} );

test( 'Stacked overlays', function() {
	var overlay = new nav.Overlay( { heading: 'Overlay 1', content: 'Text' } ),
		overlayTwo = new nav.Overlay( { heading: 'Overlay 2', content: 'Text' } );
	overlay.open();
	overlayTwo.open();
	strictEqual( $( 'html' ).hasClass( 'overlay' ), true, 'In overlay mode' );
	strictEqual( overlayTwo.$el.is( ':visible' ), true,
		'The second overlay is the active one' );
	strictEqual( overlay.$el.is( ':visible' ), false,
		'The first overlay is marked as inactive' );

	// now close the top stacked one...
	overlayTwo.close();
	strictEqual( overlayTwo.$el[0].parentNode, null, 'No longer in DOM' );
	strictEqual( overlay.$el[0].parentNode, document.body, 'Still in DOM' );
	strictEqual( overlay.$el.is( ':visible' ), true,
		'The first overlay is now active' );
	strictEqual( $( 'html' ).hasClass( 'overlay' ), true, 'Still in overlay mode' );
} );


} )( mw.mobileFrontend.require( 'navigation' ), jQuery );
