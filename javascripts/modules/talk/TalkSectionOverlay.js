( function ( M, $ ) {
	var
		Overlay = M.require( 'Overlay' ),
		popup = M.require( 'toast' ),
		api = M.require( 'api' ),
		user = M.require( 'user' ),
		Page = M.require( 'Page' ),
		pageApi = M.require( 'pageApi' ),
		TalkSectionOverlay;

	/**
	 * Overlay for showing talk page section
	 * @class TalkSectionOverlay
	 * @extends Overlay
	 * @uses Api
	 * @uses Page
	 * @uses Toast
	 */
	TalkSectionOverlay = Overlay.extend( {
		templatePartials: {
			header: mw.template.get( 'mobile.talk.overlays', 'Section/header.hogan' ),
			content: mw.template.get( 'mobile.talk.overlays', 'Section/content.hogan' )
		},
		/**
		 * @inheritdoc
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {String} defaults.title Title.
		 * @cfg {Section} defaults.section that is currently being viewed in overlay.
		 * @cfg {String} defaults.reply Reply heading.
		 * @cfg {String} defaults.info Message that informs the user their talk reply will be
		 * automatically signed.
		 */
		defaults: $.extend( {}, Overlay.prototype.defaults, {
			title: undefined,
			section: undefined,
			reply: mw.msg( 'mobile-frontend-talk-reply' ),
			info: mw.msg( 'mobile-frontend-talk-reply-info' )
		} ),
		events: $.extend( {}, Overlay.prototype.events, {
			'focus textarea': 'onFocusTextarea',
			'click .save-button': 'onSaveClick'
		} ),
		/**
		 * Fetches the talk topics of the page specified in options.title
		 * if options.section is not defined.
		 * @inheritdoc
		 */
		postRender: function ( options ) {
			var self = this;

			Overlay.prototype.postRender.apply( this, arguments );
			if ( !options.section ) {
				pageApi.getPage( options.title ).done( function ( pageData ) {
					var page = new Page( pageData );
					options.section = page.getSection( options.id );
					self.render( options );
				} );
			} else {
				this.$( '.loading' ).remove();
				this._enableComments();
			}
		},
		/**
		 * Enables comments on the current rendered talk topic
		 * @method
		 * @private
		 */
		_enableComments: function () {
			this.$commentBox = this.$( '.comment' );
			if ( user.isAnon() ) {
				this.$commentBox.remove();
			} else {
				this.$textarea = this.$commentBox.find( 'textarea' );
			}
		},
		/**
		 * Handler for focus of textarea
		 */
		onFocusTextarea: function () {
			this.$textarea.removeClass( 'error' );
		},
		/**
		 * Handle a click on the save button
		 */
		onSaveClick: function () {
			var val = this.$textarea.val(),
				self = this;

			if ( val ) {
				this.$commentBox.hide();
				this.$( '.loading' ).show();
				// sign and add newline to front
				val = '\n\n' + val + ' ~~~~';
				api.postWithToken( 'edit', {
					action: 'edit',
					title: this.options.title,
					section: this.options.id,
					appendtext: val
				} ).done( function ( data ) {
					self.$( '.loading' ).hide();
					self.$commentBox.show();
					if ( data.error ) {
						self.$textarea.addClass( 'error' );
					} else {
						self.hide();
						popup.show( mw.msg( 'mobile-frontend-talk-reply-success' ), 'toast' );
						// invalidate the cache
						pageApi.invalidatePage( self.options.title );
					}
				} );
			} else {
				this.$textarea.addClass( 'error' );
			}
		}
	} );

	M.define( 'modules/talk/TalkSectionOverlay', TalkSectionOverlay );
}( mw.mobileFrontend, jQuery ) );
