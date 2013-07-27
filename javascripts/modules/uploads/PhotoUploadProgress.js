( function( M ) {
	var Drawer = M.require( 'Drawer' ),
		ProgressBar = M.require( 'widgets/progress-bar' ),
		PhotoUploadProgress;

	PhotoUploadProgress = Drawer.extend( {
		defaults: {
			waitMessage: mw.msg( 'mobile-frontend-image-uploading-wait' ),
			cancelMessage: mw.msg( 'mobile-frontend-image-uploading-cancel' ),
			messageInterval: 10000
		},

		template: M.template.get( 'photoUploadProgress' ),
		className: 'drawer position-fixed loading',
		locked: true,

		postRender: function( options ) {
			var self = this, longMessage = false;

			this._super();

			this.$( 'a' ).on( 'click', function() {
				self.hide();
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

	M.define( 'modules/uploads/PhotoUploadProgress', PhotoUploadProgress );

}( mw.mobileFrontend ) );
