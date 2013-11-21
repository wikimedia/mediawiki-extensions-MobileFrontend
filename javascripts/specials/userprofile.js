( function( M, $ ) {
	var View = M.require( 'view' ),
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
			mw.loader.using( 'mobile.editor', function() {
				var EditorApi = M.require( 'modules/editor/EditorApi' );
				self.api = new EditorApi( { title: options.title, sectionId: 0, content: options.description } );
				_super.call( self, options );
			} );
		},
		switchToEditMode: function() {
			this.$( '.editor' ).show();
			this.$( '.edit-button, .user-description' ).hide();
		},
		switchToViewMode: function() {
			this.$( '.editor' ).hide();
			this.$( '.edit-button,.user-description' ).show();
		},
		postRender: function( options ) {
			var self = this, $form = this.$( '.editor' ),
				$loader = this.$( '.loading' ).hide();
			$form.hide();
			this.$( 'textarea' ).on( 'keyup focus', $.proxy( this, 'setCount' )  );
			// Initialize the character count
			this.setCount();
			// Initialize the edit button
			this.$( '.edit-button' ).on( 'click', $.proxy( self, 'switchToEditMode' ) );
			this.$( '.editor button' ).on( 'click', function() {
				var val = self.$( 'textarea' ).val();
				$loader.show();
				$form.hide();
				self.api.setContent( val );
				self.api.save( { summary: mw.msg( 'mobile-frontend-profile-edit-summary' ) } ).done( function() {
					$loader.hide();
					self.$( '.user-description' ).text( val || options.placeholder );
					self.switchToViewMode();
				} );
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
			username = mw.config.get( 'wgUserName' ),
			text = $container.find( '.user-description' ).text() || undefined;

		// If current user is this person make it editable
		if ( $( 'h1' ).text() === username ) {
			new EditBox( { el: $container, description: text, title: 'User:' + username + '/UserProfileIntro' } );
		}
	}

	// Once the DOM is loaded, initialize the edit button
	$( initialize );

}( mw.mobileFrontend, jQuery ) );
