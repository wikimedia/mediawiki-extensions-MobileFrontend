( function( M ) {
	var View = M.require( 'view' ),
		popup = M.require( 'notifications' ),
		ProgressBar = M.require( 'widgets/progress-bar' ),
		PhotoUploadProgress;

	PhotoUploadProgress = View.extend( {
		defaults: {
			waitMessage: mw.msg( 'mobile-frontend-image-uploading-wait' ),
			cancelMessage: mw.msg( 'mobile-frontend-image-uploading-cancel' ),
			messageInterval: 10000
		},

		template: (
			'<p class="wait">{{waitMessage}}</p>' +
			'<p class="cancel">{{{cancelMessage}}}</p>'
		),

		postRender: function( options ) {
			var self = this, longMessage = false;

			this.$( 'a' ).on( 'click', function() {
				popup.close( true );
				self.emit( 'cancel' );
				return false;
			} );

			setInterval( function() {
				if ( longMessage ) {
					self.$( '.wait' ).text( mw.msg( 'mobile-frontend-image-uploading-wait' ) );
				} else {
					self.$( '.wait' ).text( mw.msg( 'mobile-frontend-image-uploading-long' ) );
				}
				longMessage = !longMessage;
			}, options.messageInterval );
		},

		setValue: function( value ) {
			// only add progress bar if we're getting progress events
			if ( !this.progressBar ) {
				this.progressBar = new ProgressBar();
				this.progressBar.appendTo( this.$el );
			}
			this.progressBar.setValue( value );
		}
	} );

	M.define( 'uploads/PhotoUploadProgress', PhotoUploadProgress );

}( mw.mobileFrontend ) );