( function ( M ) {
	var Overlay = M.require( 'Overlay' ), AbuseFilterOverlay;
	AbuseFilterOverlay = Overlay.extend( {
		defaults: {
			confirmMessage: mw.msg( 'mobile-frontend-photo-ownership-confirm' )
		},
		templatePartials: {
			content: M.template.get( 'modules/editor/AbuseFilterOverlay' )
		},
		className: 'overlay abusefilter-overlay',

		postRender: function () {
			this._super();
			// make links open in separate tabs
			this.$( 'a' ).attr( 'target', '_blank' );
		}
	} );

	M.define( 'modules/editor/AbuseFilterOverlay', AbuseFilterOverlay );
}( mw.mobileFrontend ) );
