( function( nav, $ ) {

QUnit.module( 'MobileFrontend: mf-navigation.js' );

QUnit.test( 'Simple overlay', 1, function() {
	var overlay = new nav.Overlay( { heading: '<h2>Title</h2>', content: 'Text' } );
	overlay.show();
	strictEqual( overlay.$el[0].parentNode, document.body, 'In DOM' );
	overlay.hide();
} );

QUnit.test( 'HTML overlay', 2, function() {
	var overlay = new nav.Overlay( {
		heading: '<div id="test">Awesome: <input></div>',
		content: '<div class="content">YO</div>'
	} );
	strictEqual( overlay.$el.find( '#test' ).html(), 'Awesome: <input>' );
	strictEqual( overlay.$el.find( '.content' ).text(), 'YO' );
} );

QUnit.test( 'Close overlay', 1, function() {
	var overlay = new nav.Overlay( { heading: '<h2>Title</h2>', content: 'Text' } );
	overlay.show();
	overlay.hide();
	strictEqual( overlay.$el[0].parentNode, null, 'No longer in DOM' );
} );

QUnit.test( 'Stacked overlays', 6, function() {
	var overlay = new nav.Overlay( { heading: 'Overlay 1', content: 'Text' } ),
		overlayTwo = new nav.Overlay( { heading: 'Overlay 2', content: 'Text <button class="cancel">cancel</button>',
			parent: overlay } );
	overlay.show();
	overlayTwo.show();
	strictEqual( $( 'html' ).hasClass( 'overlay' ), true, 'In overlay mode' );
	strictEqual( overlayTwo.$el.is( ':visible' ), true,
		'The second overlay is the active one' );
	strictEqual( overlay.$el[0].parentNode, null,
		'The first overlay is no longer in the DOM' );

	// now close the top stacked one...
	overlayTwo.$( '.cancel' ).trigger( 'click' );
	strictEqual( overlayTwo.$el[0].parentNode, null, 'No longer in DOM' );
	strictEqual( overlay.$el[0].parentNode, document.body, 'Still in DOM' );
	strictEqual( $( 'html' ).hasClass( 'overlay' ), true, 'Still in overlay mode' );
	overlay.hide();
} );


} )( mw.mobileFrontend.require( 'navigation' ), jQuery );
