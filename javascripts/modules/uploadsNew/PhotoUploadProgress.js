( function( M ) {
	var OverlayNew = M.require( 'OverlayNew' ),
		ProgressBar = M.require( 'widgets/progress-bar' ),
		PhotoUploadProgress;

	PhotoUploadProgress = OverlayNew.extend( {
		defaults: {
			uploadingMsg: mw.msg( 'mobile-frontend-image-uploading' ),
			closeMsg: mw.msg( 'cancel' ),
			showCancel: false,
			cancelMsg: mw.msg( 'mobile-frontend-image-cancel-confirm' ),
			yesMsg: mw.msg( 'mobile-frontend-image-cancel-yes' ),
			noMsg: mw.msg( 'mobile-frontend-image-cancel-no' )
		},
		template: M.template.get( 'uploadsNew/PhotoUploadProgress' ),
		fullScreen: false,

		initialize: function( options ) {
			this._super( options );
			this.progressBar = new ProgressBar();
		},

		postRender: function() {
			var self = this;
			this._super();
			this.$( '.continue' ).on( M.tapEvent( 'click' ), function() {
				self.options.showCancel = false;
				self.render();
			} );
		},

		hide: function( force ) {
			if ( force ) {
				return this._super();
			} else if ( !this.options.showCancel ) {
				this.options.showCancel = true;
				this.render();
				return false;
			} else {
				this.emit( 'cancel' );
				return this._super();
			}
		},

		setValue: function( value ) {
			var $uploading = this.$( '.uploading' );
			// only add progress bar if we're getting progress events
			if ( $uploading.length && $uploading.text() !== '' ) {
				$uploading.text( '' );
				this.progressBar.appendTo( $uploading );
			}
			this.progressBar.setValue( value );
		}
	} );

	M.define( 'modules/uploadsNew/PhotoUploadProgress', PhotoUploadProgress );

}( mw.mobileFrontend ) );
