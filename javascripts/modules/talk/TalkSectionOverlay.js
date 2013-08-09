( function( M ) {

var
	Overlay = M.require( 'Overlay' ),
	popup = M.require( 'notifications' ),
	api = M.require( 'api' ),
	TalkSectionOverlay = Overlay.extend( {
		template: M.template.get( 'talkSection' ),
		defaults: {
			closeMsg: mw.msg( 'mobile-frontend-overlay-escape' ),
			reply: mw.msg( 'mobile-frontend-talk-reply' ),
			confirmMsg: mw.msg( 'mobile-frontend-editor-confirm' ),
			licenseMsg: mw.msg( 'mobile-frontend-editor-license' ),
			info: mw.msg( 'mobile-frontend-talk-reply-info' )
		},
		postRender: function( options ) {
			var self = this, $comment = this.$( '.comment' ),
				$textarea = $comment.find( 'textarea' );
			this._super( options );
			this.$( '.loading' ).remove();
			if ( !M.isLoggedIn() || mw.config.get( 'wgMFMode' ) !== 'alpha' ) {
				$comment.remove();
			} else {
				$textarea.on( 'focus', function() {
					$textarea.removeClass( 'error' );
				} );
				$comment.find( 'button' ).on( 'click', function() {
					var val = $textarea.val();
					if ( val ) {
						$comment.hide();
						self.$( '.loading' ).show();
						// sign and add newline to front
						val = '\n\n' + val + ' ~~~~';
						api.getToken().done( function( token ) {
							api.post( {
								action: 'edit',
								title: options.title,
								section: options.section.id,
								token: token,
								appendtext: val
							} ).done( function( data ) {
								self.$( '.loading' ).hide();
								$comment.show();
								if ( data.error ) {
									$textarea.addClass( 'error' );
								} else {
									self.hide();
									self.parent.hide();
									popup.show( mw.msg( 'mobile-frontend-talk-reply-success' ), 'toast' );
									// invalidate the cache
									M.history.invalidateCachedPage( options.title );
								}
							} );
						} );
					} else {
						$textarea.addClass( 'error' );
					}
				} );
			}
		}
	} );

	M.define( 'modules/talk/TalkSectionOverlay', TalkSectionOverlay );

}( mw.mobileFrontend ) );

