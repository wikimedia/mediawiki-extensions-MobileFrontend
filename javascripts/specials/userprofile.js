( function( M, $ ) {
	var View = M.require( 'view' ),
		api = M.require( 'api' ),
		limit = mw.config.get( 'wgMFMaxDescriptionChars' ),
		EditBox;

	EditBox = View.extend( {
		template: M.template.get( 'EditBox' ),
		defaults: {
			limit: limit,
			submit: mw.message( 'htmlform-submit' ),
			label: mw.message( 'mobile-frontend-editor-edit' ),
			placeholder: mw.message( 'mobile-frontend-profile-description-placeholder' )
		},
		initialize: function( options ) {
			var self = this, _super = self._super;
			api.getToken().done( function( token ) {
				options.token = token;
				_super.call( self, options );
			} );
		},
		postRender: function( options ) {
			var self = this, $form = this.$( 'form' );
			$form.hide();
			this.$( 'textarea' ).on( 'keyup focus', $.proxy( this, 'setCount' )  );
			// Initialize the character count
			this.setCount();
			// Initialize the edit button
			this.$( '.edit-button' ).on( 'click', function() {
				$form.show();
				$( this ).hide();
				self.$( '.user-description' ).hide();
			} );
			this._super( options );
		},
		setCount: function() {
			var $source = this.$( 'textarea' ),
				$counterElement = this.$( '.character-counter' ),
				chars = $source.val().length;

			if ( chars > limit ) {
				$source.val( $source.val().substr( 0, limit ) );
				chars = limit;
			}
			$counterElement.text( limit - chars );
			if ( limit - chars < 10 ) {
				$counterElement.addClass( 'warning' );
			} else {
				$counterElement.removeClass( 'warning' );
			}
		}
	} );

	function initialize() {
		var $container = $( '.user-description-container' ),
			text = $container.find( '.user-description' ).text() || undefined;

		// If current user is this person make it editable
		if ( $( 'h1' ).text() === mw.config.get( 'wgUserName' ) ) {
			new EditBox( { el: $container, description: text } );
		}
	}

	// Once the DOM is loaded, initialize the edit button
	$( initialize );

}( mw.mobileFrontend, jQuery ) );
