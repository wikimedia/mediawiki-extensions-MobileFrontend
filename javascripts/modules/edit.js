( function( M, $ ) {

	var Overlay = M.require( 'navigation' ).Overlay,
		EditOverlay;

	EditOverlay = Overlay.extend( {
		template: M.template.get( 'overlays/edit/edit' ),
		className: 'mw-mf-overlay edit-overlay',

		initialize: function( options ) {
			this._super( options );
			this.$( 'textarea' ).focus();
		}
	} );

	( function() {
		var editOverlay;

		if (
			( mw.config.get( 'wgMFAnonymousEditing' ) || mw.config.get( 'wgUserName' ) ) &&
			mw.config.get( 'wgIsPageEditable' )
		) {
			editOverlay = new EditOverlay();
			// FIXME: button class inline
			$( '<a id="edit-page">' ).
				text( mw.msg( 'edit' ) ).
				prependTo( '#content' ).
				on( 'click', $.proxy( editOverlay, 'show' ) );
		}
	}() );

}( mw.mobileFrontend, jQuery ) );
