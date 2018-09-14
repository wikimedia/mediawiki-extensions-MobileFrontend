( function ( M ) {
	var TalkOverlayBase = M.require( 'mobile.talk.overlays/TalkOverlayBase' ),
		util = M.require( 'mobile.startup/util' ),
		popup = M.require( 'mobile.startup/toast' ),
		user = M.require( 'mobile.startup/user' ),
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
		templatePartials: util.extend( {}, TalkOverlayBase.prototype.templatePartials, {
			header: mw.template.get( 'mobile.talk.overlays', 'Section/header.hogan' ),
			content: mw.template.get( 'mobile.talk.overlays', 'Section/content.hogan' )
		} ),
		/**
		 * @memberof TalkSectionOverlay
		 * @instance
		 * @mixes TalkOverlayBase#defaults
		 * @property {Object} defaults Default options hash.
		 * @property {string} defaults.title Title.
		 * @property {Section} defaults.section that is currently being viewed in overlay.
		 * @property {string} defaults.reply Reply heading.
		 * @property {string} defaults.info Message that informs the user their talk reply will be
		 * automatically signed.
		 */
		defaults: util.extend( {}, TalkOverlayBase.prototype.defaults, {
			saveButton: new Button( {
				block: true,
				additionalClassNames: 'save-button',
				progressive: true,
				label: mw.msg( 'mobile-frontend-editor-save' )
			} ).options,
			title: undefined,
			section: undefined,
			reply: mw.msg( 'mobile-frontend-talk-reply' ),
			info: mw.msg( 'mobile-frontend-talk-reply-info' )
		} ),
		/**
		 * @inheritdoc
		 * @memberof TalkSectionOverlay
		 * @instance
		 */
		events: util.extend( {}, TalkOverlayBase.prototype.events, {
			'focus textarea': 'onFocusTextarea',
			'click .save-button': 'onSaveClick'
		} ),
		/**
		 * Fetches the talk topics of the page specified in options.title
		 * if options.section is not defined.
		 * @inheritdoc
		 * @memberof TalkSectionOverlay
		 * @instance
		 */
		postRender: function () {
			TalkOverlayBase.prototype.postRender.apply( this );
			this.$saveButton = this.$( '.save-button' );
			if ( !this.options.section ) {
				this.renderFromApi( this.options );
			} else {
				this.hideSpinner();
				this._enableComments();
			}
		},
		/**
		 * Enables comments on the current rendered talk topic
		 * @memberof TalkSectionOverlay
		 * @instance
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
		 * @memberof TalkSectionOverlay
		 * @instance
		 * @param {Object} options Render options
		 */
		renderFromApi: function ( options ) {
			var self = this;

			this.pageGateway.getPage( options.title ).then( function ( pageData ) {
				var page = new Page( pageData );
				options.section = page.getSection( options.id );
				self.render( options );
				self.hideSpinner();
			} );
		},
		/**
		 * Handler for focus of textarea
		 * @memberof TalkSectionOverlay
		 * @instance
		 */
		onFocusTextarea: function () {
			this.$textarea.removeClass( 'error' );
		},
		/**
		 * Handle a click on the save button
		 * @memberof TalkSectionOverlay
		 * @instance
		 */
		onSaveClick: function () {
			var val = this.$textarea.val(),
				self = this;

			function enableSaveButton() {
				self.$saveButton.prop( 'disabled', false );
			}
			if ( val ) {
				// show a spinner
				this.showSpinner();
				this.$saveButton.prop( 'disabled', true );
				// sign and add newline to front
				val = '\n\n' + this.autosign( val );
				// FIXME: This should be using a gateway
				// e.g. TalkGateway, PageGateway or EditorGateway
				this.editorApi.postWithToken( 'edit', {
					action: 'edit',
					title: this.options.title,
					section: this.options.id,
					appendtext: val,
					redirect: true
				} ).then( function () {
					popup.show( mw.msg( 'mobile-frontend-talk-reply-success' ) );
					// invalidate the cache
					self.pageGateway.invalidatePage( self.options.title );

					self.renderFromApi( self.options );

					enableSaveButton();
				}, function ( data, response ) {
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
						whitelistedErrorInfo.indexOf( response.error.code ) > -1
					) {
						msg = response.error.info;
					} else {
						msg = mw.msg( 'mobile-frontend-editor-error' );
					}

					self.hideSpinner();
					popup.show( msg, 'toast error' );

					enableSaveButton();
				} );
			} else {
				this.$textarea.addClass( 'error' );
			}
		}
	} );

	M.define( 'mobile.talk.overlays/TalkSectionOverlay', TalkSectionOverlay ); // resource-modules-disable-line
}( mw.mobileFrontend ) );
