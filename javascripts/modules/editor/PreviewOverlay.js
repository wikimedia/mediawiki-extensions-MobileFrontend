( function( M, $ ) {

var Overlay = M.require( 'Overlay' ),
	Section = M.require( 'Section' ),
	api = M.require( 'api' ),
	PreviewOverlay = Overlay.extend( {
		defaults: {
			// FIXME: currently heading is determined during initialise
			heading: '',
			closeMsg: Overlay.prototype.defaults.closeMsg,
			explanation: mw.msg( 'mobile-frontend-editor-preview-explanation' )
		},
		template: M.template.get( 'overlays/editPreview' ),
		className: 'mw-mf-overlay editor-overlay',

		initialize: function( options ) {
			this._super( options );
			var self = this,
				d = $.Deferred(),
				$container = this.$( '.content' );

			this.$( '.preview-cancel' ).on( 'click', function() {
				self.hide();
			} );
			api.get( {
				action: 'parse',
				title: options.title,
				text: options.wikitext,
				prop: 'text'
			} ).then( function( resp ) {
				// FIXME: Don't trust the api response
				if ( resp && resp.parse && resp.parse.text ) {
					d.resolve( resp.parse.text['*'] );
				} else {
					d.reject();
				}
			} );

			d.done( function( parsedText ) {
				// FIXME: hacky
				var $tmp = $( '<div>' ).html( parsedText ), heading;
				// FIXME: yuck.
				$tmp.find( '.mw-editsection' ).remove();
				// Extract the first heading
				heading = $tmp.find( 'h2' ).eq( 0 ).text();

				// remove heading from the parsed output
				$tmp.find( 'h2' ).eq( 0 ).remove();

				new Section( {
					el: $container,
					index: 'preview',
					// doesn't account for headings with html inside
					heading: heading,
					content: $tmp.html()
				} );
				// Emit event so we can perform enhancements to page
				M.emit( 'edit-preview', self );
			} ).fail( function() {
				$container.removeClass( 'loading' ).addClass( 'error' ).
					text( mw.msg( 'mobile-frontend-editor-error-preview' ) );
			} );
		}
	} );

	M.define( 'modules/editor/PreviewOverlay', PreviewOverlay );

}( mw.mobileFrontend, jQuery ) );
