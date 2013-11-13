// FIXME: merge with Overlay and remove when OverlayNew gets to stable
( function( M ) {

	var Overlay = M.require( 'Overlay' ),
	OverlayNew = Overlay.extend( {
		className: 'overlay',
		template: M.template.get( 'OverlayNew' ),
		defaults: {
			headerButtonsListClassName: 'v-border bottom-border'
		}
	} );

	M.define( 'OverlayNew', OverlayNew );

}( mw.mobileFrontend ) );
