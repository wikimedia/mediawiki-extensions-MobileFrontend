( function( M, $ ) {
	var View = M.require( 'view' ),
		popup = M.require( 'notifications' ),
		Overlay = M.require( 'Overlay' ),
		LearnMoreOverlay = M.require( 'uploads/LearnMoreOverlay' ),
		ownershipMessage = mw.msg( 'mobile-frontend-photo-ownership', mw.config.get( 'wgUserName' ), mw.user ),
		PhotoUploaderPreview;

	PhotoUploaderPreview = View.extend( {
		defaults: {
			loadingMessage: mw.msg( 'mobile-frontend-image-loading' ),
			license: mw.msg( 'mobile-frontend-photo-license' ),
			cancelButton: mw.msg( 'mobile-frontend-photo-cancel' ),
			submitButton: mw.msg( 'mobile-frontend-photo-submit' ),
			descriptionPlaceholder: mw.msg( 'mobile-frontend-photo-caption-placeholder' ),
			help: mw.msg( 'mobile-frontend-photo-ownership-help' ),
			ownerStatement: ownershipMessage
		},

		template: M.template.get( 'photoUploadPreview' ),

		initialize: function( options ) {
			this.log = options.log;
			this._super( options );
		},

		postRender: function() {
			var self = this,
				$overlay, $description, $submitButton;

			this.overlay = new Overlay( {
				content: $( '<div>' ).html( this.$el ).html()
			} );
			$overlay = this.overlay.$el;

			$description = $overlay.find( 'textarea' );
			$submitButton = $overlay.find( 'button.submit' );
			this.$description = $description;

			// make license links open in separate tabs
			$overlay.find( '.license a' ).attr( 'target', '_blank' );
			// use input event too, Firefox doesn't fire keyup on many devices:
			// https://bugzilla.mozilla.org/show_bug.cgi?id=737658
			$description.on( 'keyup input', function() {
				if ( $description.val() ) {
					$submitButton.removeAttr( 'disabled' );
				} else {
					$submitButton.attr( 'disabled', true );
				}
			} );

			$submitButton.on( 'click', function() {
				self.emit( 'submit' );
			} );
			$overlay.find( 'button.cancel' ).on( 'click', function() {
				self.emit( 'cancel' );
			} );
		},

		getDescription: function() {
			return this.$description.val();
		},

		setImageUrl: function( url ) {
			var self = this, $img;

			this.imageUrl = url;
			this.overlay.$( '.loading' ).remove();
			this.overlay.$( 'a.help' ).on( 'click', function( ev ) {
				ev.preventDefault(); // avoid setting #
				var overlay = new LearnMoreOverlay( {
					parent: self.overlay,
					bulletPoints: [
						mw.msg( 'mobile-frontend-photo-ownership-bullet-one' ),
						mw.msg( 'mobile-frontend-photo-ownership-bullet-two' ),
						mw.msg( 'mobile-frontend-photo-ownership-bullet-three' )
					],
					leadText: ownershipMessage
				} );
				overlay.show();
				self.log( { action: 'whatDoesThisMean' } );
			} );
			$img = $( '<img>' ).attr( 'src', url ).prependTo( this.overlay.$( '.photoPreview' ) );

			// When using a bad filetype close the overlay
			$img.on( 'error', function() {
				popup.show( mw.msg( 'mobile-frontend-photo-upload-error-file-type' ), 'toast error' );
				self.overlay.hide();
			} );
		}
	} );

	M.define( 'uploads/PhotoUploaderPreview', PhotoUploaderPreview );

}( mw.mobileFrontend, jQuery ) );
