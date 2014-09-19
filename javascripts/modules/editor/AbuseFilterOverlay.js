( function ( M ) {
	var Overlay = M.require( 'Overlay' ), AbuseFilterOverlay;
	AbuseFilterOverlay = Overlay.extend( {
		defaults: {
			confirmMessage: mw.msg( 'mobile-frontend-photo-ownership-confirm' )
		},
		templatePartials: {
			content: M.template.get( 'modules/editor/AbuseFilterOverlay.hogan' )
		},
		className: 'overlay abusefilter-overlay',

		postRender: function () {
			Overlay.prototype.postRender.apply( this, arguments );
			// make links open in separate tabs
			this.$( 'a' ).attr( 'target', '_blank' );
		}
	} );

	M.define( 'modules/editor/AbuseFilterOverlay', AbuseFilterOverlay );
}( mw.mobileFrontend ) );
