( function( M, $ ) {
	var popup = M.require( 'notifications' ),
		Overlay = M.require( 'Overlay' ),
		LearnMoreOverlay = M.require( 'modules/uploads/LearnMoreOverlay' ),
		ownershipMessage = mw.msg( 'mobile-frontend-photo-ownership', mw.config.get( 'wgUserName' ), mw.user ),
		PhotoUploaderPreview;

	PhotoUploaderPreview = Overlay.extend( {
		defaults: {
			loadingMessage: mw.msg( 'mobile-frontend-image-loading' ),
			license: mw.msg( 'mobile-frontend-photo-license' ),
			cancelButton: mw.msg( 'mobile-frontend-photo-cancel' ),
			submitButton: mw.msg( 'mobile-frontend-photo-submit' ),
			descriptionPlaceholder: mw.msg( 'mobile-frontend-photo-caption-placeholder' ),
			help: mw.msg( 'mobile-frontend-photo-ownership-help' ),
			ownerStatement: ownershipMessage
		},

		className: 'mw-mf-overlay photo-overlay',

		template: M.template.get( 'uploads/PhotoUploadPreview' ),

		initialize: function( options ) {
			this.log = options.log;
			this._super( options );
		},

		postRender: function() {
			var self = this, $description, $submitButton;

			this._super();

			this.$description = $description = this.$( 'textarea' );
			$submitButton = this.$( '.submit' ).on( 'click', function() {
				self.emit( 'submit' );
			} );
			this.$( '.cancel' ).on( 'click', function() {
				self.emit( 'cancel' );
			} );

			// make license links open in separate tabs
			this.$( '.license a' ).attr( 'target', '_blank' );
			// use input event too, Firefox doesn't fire keyup on many devices:
			// https://bugzilla.mozilla.org/show_bug.cgi?id=737658
			$description.on( 'keyup input', function() {
				if ( $description.val() ) {
					$submitButton.removeAttr( 'disabled' );
				} else {
					$submitButton.attr( 'disabled', true );
				}
			} );
		},

		getDescription: function() {
			return this.$description.val();
		},

		setImageUrl: function( url ) {
			var self = this, $img;

			this.imageUrl = url;
			this.$( '.loading' ).remove();
			this.$( 'a.help' ).on( 'click', function( ev ) {
				ev.preventDefault(); // avoid setting #
				new LearnMoreOverlay( {
					parent: self,
					bulletPoints: [
						mw.msg( 'mobile-frontend-photo-ownership-bullet-one' ),
						mw.msg( 'mobile-frontend-photo-ownership-bullet-two' ),
						mw.msg( 'mobile-frontend-photo-ownership-bullet-three' )
					],
					leadText: ownershipMessage
				} ).show();
				self.log( { action: 'whatDoesThisMean' } );
			} );
			$img = $( '<img>' ).attr( 'src', url ).prependTo( this.$( '.content' ) );

			// When using a bad filetype close the overlay
			$img.on( 'error', function() {
				popup.show( mw.msg( 'mobile-frontend-photo-upload-error-file-type' ), 'toast error' );
				self.hide();
			} );
		}
	} );

	M.define( 'modules/uploads/PhotoUploaderPreview', PhotoUploaderPreview );

}( mw.mobileFrontend, jQuery ) );
