( function ( M, $ ) {
	var TalkOverlayBase = M.require( 'mobile.talk.overlays/TalkOverlayBase' ),
		popup = M.require( 'mobile.toast/toast' ),
		user = M.require( 'mobile.user/user' ),
		Page = M.require( 'mobile.startup/Page' ),
		Button = M.require( 'mobile.startup/Button' );

	/**
	 * Overlay for showing talk page section
	 * @class TalkSectionOverlay
	 * @extends TalkOverlayBase
	 * @uses Page
	 * @uses Button
	 * @uses Toast
	 */
	function TalkSectionOverlay() {
		TalkOverlayBase.apply( this, arguments );
	}

	OO.mfExtend( TalkSectionOverlay, TalkOverlayBase, {
		templatePartials: $.extend( {}, TalkOverlayBase.prototype.templatePartials, {
			header: mw.template.get( 'mobile.talk.overlays', 'Section/header.hogan' ),
			content: mw.template.get( 'mobile.talk.overlays', 'Section/content.hogan' )
		} ),
		/**
		 * @inheritdoc
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {String} defaults.title Title.
		 * @cfg {Section} defaults.section that is currently being viewed in overlay.
		 * @cfg {String} defaults.reply Reply heading.
		 * @cfg {String} defaults.info Message that informs the user their talk reply will be
		 * automatically signed.
		 */
		defaults: $.extend( {}, TalkOverlayBase.prototype.defaults, {
			saveButton: new Button( {
				block: true,
				additionalClassNames: 'save-button',
				constructive: true,
				label: mw.msg( 'mobile-frontend-editor-save' )
			} ).options,
			title: undefined,
			section: undefined,
			reply: mw.msg( 'mobile-frontend-talk-reply' ),
			info: mw.msg( 'mobile-frontend-talk-reply-info' )
		} ),
		events: $.extend( {}, TalkOverlayBase.prototype.events, {
			'focus textarea': 'onFocusTextarea',
			'click .save-button': 'onSaveClick'
		} ),
		/**
		 * Fetches the talk topics of the page specified in options.title
		 * if options.section is not defined.
		 * @inheritdoc
		 */
		postRender: function () {
			TalkOverlayBase.prototype.postRender.apply( this );
			this.$saveButton = $( '.save-button' );
			if ( !this.options.section ) {
				this.renderFromApi( this.options );
			} else {
				this.clearSpinner();
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
		 * Loads the discussion from api and add it to the Overlay
		 * @param {Object} options Render options
		 */
		renderFromApi: function ( options ) {
			var self = this;

			this.pageGateway.getPage( options.title ).done( function ( pageData ) {
				var page = new Page( pageData );
				options.section = page.getSection( options.id );
				self.render( options );
				self.clearSpinner();
			} );
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
				// show a spinner
				this.showSpinner();
				this.$saveButton.prop( 'disabled', true );
				// sign and add newline to front
				val = '\n\n' + val + ' ~~~~';
				// FIXME: This should be using a gateway e.g. TalkGateway, PageGateway or EditorGateway
				this.editorApi.postWithToken( 'edit', {
					action: 'edit',
					title: this.options.title,
					section: this.options.id,
					appendtext: val
				} ).done( function () {
					popup.show( mw.msg( 'mobile-frontend-talk-reply-success' ) );
					// invalidate the cache
					self.pageGateway.invalidatePage( self.options.title );

					self.renderFromApi( self.options );
				} ).fail( function ( data, response ) {
					// FIXME: Code sharing with EditorOverlay?
					var msg,
						// When save failed with one of these error codes, the returned
						// message in response.error.info will be forwarded to the user.
						// FIXME: This shouldn't be needed when info texts are all localized.
						whitelistedErrorInfo = [
							'readonly',
							'blocked',
							'autoblocked'
						];

					if (
						response.error &&
						$.inArray( response.error.code, whitelistedErrorInfo ) > -1
					) {
						msg = response.error.info;
					} else {
						msg = mw.msg( 'mobile-frontend-editor-error' );
					}

					self.clearSpinner();
					popup.show( msg, 'toast error' );
				} ).always( function () {
					self.$saveButton.prop( 'disabled', false );
				} );
			} else {
				this.$textarea.addClass( 'error' );
			}
		}
	} );

	M.define( 'mobile.talk.overlays/TalkSectionOverlay', TalkSectionOverlay );
}( mw.mobileFrontend, jQuery ) );
