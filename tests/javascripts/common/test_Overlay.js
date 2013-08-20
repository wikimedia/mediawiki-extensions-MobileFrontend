( function( Overlay, $ ) {

QUnit.module( 'MobileFrontend: Overlay.js' );

QUnit.test( 'Simple overlay', 1, function() {
	var overlay = new Overlay( { heading: '<h2>Title</h2>', content: 'Text' } );
	overlay.show();
	strictEqual( overlay.$el[0].parentNode, document.body, 'In DOM' );
	overlay.hide();
} );

QUnit.test( 'HTML overlay', 2, function() {
	var overlay = new Overlay( {
		heading: '<div id="test">Awesome: <input></div>',
		content: '<div class="content">YO</div>'
	} );
	strictEqual( overlay.$el.find( '#test' ).html(), 'Awesome: <input>' );
	strictEqual( overlay.$el.find( '.content' ).text(), 'YO' );
} );

QUnit.test( 'Close overlay', 1, function() {
	var overlay = new Overlay( { heading: '<h2>Title</h2>', content: 'Text' } );
	overlay.show();
	overlay.hide();
	strictEqual( overlay.$el[0].parentNode, null, 'No longer in DOM' );
} );

QUnit.test( 'Stacked overlays', 6, function() {
	var overlay = new Overlay( { heading: 'Overlay 1', content: 'Text' } ),
		overlayTwo = new Overlay( { heading: 'Overlay 2', content: 'Text <button class="cancel">cancel</button>',
			parent: overlay } );
	overlay.show();
	overlayTwo.show();
	strictEqual( $( 'html' ).hasClass( 'overlay-enabled' ), true, 'In overlay mode' );
	strictEqual( overlayTwo.$el.is( ':visible' ), true,
		'The second overlay is the active one' );
	strictEqual( overlay.$el[0].parentNode, null,
		'The first overlay is no longer in the DOM' );

	// now close the top stacked one...
	overlayTwo.$( '.cancel' ).trigger( 'tap' );
	strictEqual( overlayTwo.$el[0].parentNode, null, 'No longer in DOM' );
	strictEqual( overlay.$el[0].parentNode, document.body, 'Still in DOM' );
	strictEqual( $( 'html' ).hasClass( 'overlay-enabled' ), true, 'Still in overlay mode' );
	overlay.hide();
} );


} )( mw.mobileFrontend.require( 'Overlay' ), jQuery );
