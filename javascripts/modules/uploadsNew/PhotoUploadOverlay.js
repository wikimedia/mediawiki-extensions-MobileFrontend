( function( M, $ ) {
	var popup = M.require( 'notifications' ),
		OverlayNew = M.require( 'OverlayNew' ),
		LearnMoreOverlay = M.require( 'modules/uploadsNew/LearnMoreOverlay' ),
		ownershipMessage = mw.msg( 'mobile-frontend-photo-ownership', mw.config.get( 'wgUserName' ), mw.user ),
		PhotoUploadOverlay;

	PhotoUploadOverlay = OverlayNew.extend( {
		defaults: {
			license: mw.msg( 'mobile-frontend-photo-license' ),
			descriptionPlaceholder: mw.msg( 'mobile-frontend-photo-caption-placeholder' ),
			help: mw.msg( 'mobile-frontend-photo-ownership-help' ),
			ownerStatement: ownershipMessage,
			heading: mw.msg( 'mobile-frontend-image-heading-describe' ),
			headerButtons: [
				{ className: 'submit icon', msg: mw.msg( 'mobile-frontend-photo-submit' ) }
			]
		},

		className: 'overlay photo-overlay',

		templatePartials: {
			content: M.template.get( 'uploadsNew/PhotoUploadOverlay' )
		},

		initialize: function( options ) {
			this.log = options.log;
			this._super( options );
		},

		postRender: function() {
			var self = this, $description, $submitButton;

			this._super();

			this.$description = $description = this.$( 'textarea' );
			$submitButton = this.$( '.submit' ).
				prop( 'disabled', true ).
				on( 'click', function() {
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
				$submitButton.prop( 'disabled', $description.val() === '' );
			} );
		},

		getDescription: function() {
			return this.$description.val();
		},

		setImageUrl: function( url ) {
			var self = this, $preview = this.$( '.preview' );

			this.imageUrl = url;
			$preview.removeClass( 'loading' );
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
			$( '<img>' ).
				attr( 'src', url ).
				appendTo( $preview ).
				on( 'error', function() {
					// When using a bad filetype close the overlay
					popup.show( mw.msg( 'mobile-frontend-photo-upload-error-file-type' ), 'toast error' );
					self.hide();
				} );
			}
	} );

	M.define( 'modules/uploadsNew/PhotoUploadOverlay', PhotoUploadOverlay );

}( mw.mobileFrontend, jQuery ) );
