var EditorOverlayBase = require( './EditorOverlayBase' ),
	util = require( '../mobile.startup/util' ),
	Section = require( '../mobile.startup/Section' ),
	saveFailureMessage = require( './saveFailureMessage' ),
	EditorGateway = require( './EditorGateway' ),
	AbuseFilterPanel = require( './AbuseFilterPanel' ),
	Button = require( '../mobile.startup/Button' ),
	mfExtend = require( '../mobile.startup/mfExtend' ),
	BlockMessage = require( './BlockMessage' ),
	VisualEditorOverlay = require( './VisualEditorOverlay' ),
	MessageBox = require( '../mobile.startup/MessageBox' );

/**
 * Overlay that shows an editor
 * @class EditorOverlay
 * @uses Section
 * @uses AbuseFilterPanel
 * @uses EditorGateway
 * @uses VisualEditorOverlay
 * @extends EditorOverlayBase
 *
 * @param {Object} options Configuration options
 */
function EditorOverlay( options ) {
	this.isFirefox = /firefox/i.test( window.navigator.userAgent );
	this.gateway = new EditorGateway( {
		api: options.api,
		title: options.title,
		sectionId: options.sectionId,
		oldId: options.oldId,
		isNewPage: options.isNewPage
	} );
	this.readOnly = !!options.oldId; // If old revision, readOnly mode
	if ( this.isVisualEditorEnabled() ) {
		options.editSwitcher = true;
	}
	if ( this.readOnly ) {
		options.readOnly = true;
		options.editingMsg = mw.msg( 'mobile-frontend-editor-viewing-source-page', options.title );
	} else {
		options.editingMsg = mw.msg( 'mobile-frontend-editor-editing-page', options.title );
	}
	// be explicit here. This may have been initialized from VE.
	options.isVisualEditor = false;
	options.previewingMsg = mw.msg( 'mobile-frontend-editor-previewing-page', options.title );
	EditorOverlayBase.call(
		this,
		util.extend( true,
			{ events: { 'input .wikitext-editor': 'onInputWikitextEditor' } },
			options
		)
	);
}

mfExtend( EditorOverlay, EditorOverlayBase, {
	/**
	 * @inheritdoc
	 * @memberof EditorOverlay
	 * @instance
	 */
	templatePartials: util.extend( {}, EditorOverlayBase.prototype.templatePartials, {
		content: mw.template.get( 'mobile.editor.overlay', 'content.hogan' )
	} ),
	/**
	 * @memberof EditorOverlay
	 * @instance
	 */
	editor: 'wikitext',
	/**
	 * @memberof EditorOverlay
	 * @instance
	 */
	sectionLine: '',

	/**
	 * Check whether VisualEditor is enabled or not.
	 * @memberof EditorOverlay
	 * @instance
	 * @return {boolean}
	 */
	isVisualEditorEnabled: function () {
		var ns = mw.config.get( 'wgVisualEditorConfig' ) &&
			mw.config.get( 'wgVisualEditorConfig' ).namespaces;

		return ns &&
			ns.indexOf(
				mw.config.get( 'wgNamespaceNumber' )
			) > -1 &&
			mw.config.get( 'wgTranslatePageTranslation' ) !== 'translation' &&
			mw.config.get( 'wgPageContentModel' ) === 'wikitext';
	},
	/**
	 * Wikitext Editor input handler
	 * @memberof EditorOverlay
	 * @instance
	 */
	onInputWikitextEditor: function () {
		this.gateway.setContent( this.$el.find( '.wikitext-editor' ).val() );
		this.$el.find( '.continue, .submit' ).prop( 'disabled', false );
	},
	/**
	 * @inheritdoc
	 * @memberof EditorOverlay
	 * @instance
	 */
	onClickContinue: function ( ev ) {
		// handle the click on "Edit without logging in"
		if ( this.options.isAnon && this.$el.find( ev.target ).hasClass( 'anonymous' ) ) {
			this._showEditorAfterWarning();
			return false;
		}
		EditorOverlayBase.prototype.onClickContinue.apply( this, arguments );
	},
	/**
	 * @inheritdoc
	 * @memberof EditorOverlay
	 * @instance
	 */
	onClickBack: function () {
		EditorOverlayBase.prototype.onClickBack.apply( this, arguments );
		this._hidePreview();
	},
	/**
	 * @inheritdoc
	 * @memberof EditorOverlay
	 * @instance
	 */
	postRender: function () {
		var self = this,
			options = this.options,
			$anonWarning = this.$el.find( '.anonwarning' );

		if ( this.isVisualEditorEnabled() ) {
			mw.loader.using( 'ext.visualEditor.switching' ).then( function () {
				var switchToolbar,
					toolFactory = new OO.ui.ToolFactory(),
					toolGroupFactory = new OO.ui.ToolGroupFactory();

				toolFactory.register( mw.libs.ve.MWEditModeVisualTool );
				toolFactory.register( mw.libs.ve.MWEditModeSourceTool );
				switchToolbar = new OO.ui.Toolbar( toolFactory, toolGroupFactory, {
					classes: [ 'editor-switcher' ]
				} );

				switchToolbar.on( 'switchEditor', function ( mode ) {
					if ( mode === 'visual' ) {
						// If the user tries to switch to the VisualEditor,
						// check if any changes have been made,
						// and if so, tell the user they have to save first.
						if ( !self.gateway.hasChanged ) {
							// TODO: Be more selective in which options we pass between editors
							self._switchToVisualEditor( self.options );
						} else {
							// TODO: Replace with an OOUI dialog
							if ( window.confirm( mw.msg( 'mobile-frontend-editor-switch-confirm' ) ) ) {
								self.onStageChanges();
							}
						}
					}
				} );

				switchToolbar.setup( [
					{
						name: 'editMode',
						type: 'list',
						icon: 'edit',
						title: mw.msg( 'visualeditor-mweditmode-tooltip' ),
						include: [ 'editModeVisual', 'editModeSource' ]
					}
				] );

				self.$el.find( '.switcher-container' ).html( switchToolbar.$element );
				switchToolbar.emit( 'updateState' );
			} );
		}

		EditorOverlayBase.prototype.postRender.apply( this );

		this.$preview = this.$el.find( '.preview' );
		this.$content = this.$el.find( '.wikitext-editor' );
		this.$content.addClass( 'mw-editfont-' + mw.user.options.get( 'editfont' ) );
		if ( options.isAnon ) {
			// add anonymous warning actions if present
			if ( $anonWarning.length ) {
				$anonWarning.find( ' > div' ).prepend(
					new MessageBox( {
						className: 'warningbox anon-msg',
						msg: mw.msg( 'mobile-frontend-editor-anonwarning' )
					} ).$el
				);
				if ( options.isAnon ) {
					this._renderAnonWarning( $anonWarning, options );
				}
			}
			this.$anonWarning = $anonWarning;
			this.$content.hide();
			// the user has to click login, signup or edit without login,
			// disable "Next" button on top right
			this.$anonHiddenButtons = this.$el.find( '.overlay-header .continue, .editor-switcher' ).hide();
			this.hideSpinner();
		}
		// make license links open in separate tabs
		this.$el.find( '.license a' ).attr( 'target', '_blank' );

		this.abuseFilterPanel = new AbuseFilterPanel( {
			overlayManager: this.overlayManager
		} ).appendTo( this.$el.find( '.panels' ) );

		// If in readOnly mode, make textarea readonly
		if ( this.readOnly ) {
			this.$content.prop( 'readonly', true );
		}

		this.$content.on( 'input', this._resizeEditor.bind( this ) );

		if ( !self.options.isAnon ) {
			this._loadContent();
		}
	},

	/**
	 * Sets additional values used for anonymous editing warning.
	 * @memberof EditorOverlay
	 * @instance
	 * @private
	 * @param {jQuery.Element} $anonWarning
	 * @param {Object} options
	 */
	_renderAnonWarning: function ( $anonWarning, options ) {
		var params = util.extend( {
			// use wgPageName as this includes the namespace if outside Main
				returnto: options.returnTo || mw.config.get( 'wgPageName' ),
				returntoquery: 'action=edit&section=' + options.sectionId,
				warning: 'mobile-frontend-edit-login-action'
			}, options.queryParams ),
			signupParams = util.extend( {
				type: 'signup',
				warning: 'mobile-frontend-edit-signup-action'
			}, options.signupQueryParams ),
			anonymousEditorActions = [
				new Button( {
					label: mw.msg( 'mobile-frontend-editor-anon' ),
					block: true,
					additionalClassNames: 'continue anonymous',
					progressive: true
				} ),
				new Button( {
					block: true,
					href: mw.util.getUrl( 'Special:UserLogin', params ),
					label: mw.msg( 'mobile-frontend-watchlist-cta-button-login' )
				} ),
				new Button( {
					block: true,
					href: mw.util.getUrl( 'Special:UserLogin', util.extend( params, signupParams ) ),
					label: mw.msg( 'mobile-frontend-watchlist-cta-button-signup' )
				} )
			];

		$anonWarning.find( '.actions' ).append(
			anonymousEditorActions.map( function ( action ) {
				return action.$el;
			} )
		);
	},

	/**
	 * Handles click on "Edit without login" in anonymous editing warning.
	 * @memberof EditorOverlay
	 * @instance
	 * @private
	 */
	_showEditorAfterWarning: function () {
		this.showSpinner();
		this.$anonWarning.hide();
		// reenable "Next" button
		this.$anonHiddenButtons.show();
		this._loadContent();
	},

	/**
	 * Prepares the preview interface and reveals the save screen of the overlay
	 * @inheritdoc
	 * @memberof EditorOverlay
	 * @instance
	 */
	onStageChanges: function () {
		var self = this,
			params = {
				text: this.getContent()
			};

		this.scrollTop = util.getDocument().find( 'body' ).scrollTop();
		this.$content.hide();
		this.showSpinner();

		if ( mw.config.get( 'wgIsMainPage' ) ) {
			params.mainpage = 1; // Setting it to 0 will have the same effect
		}

		function hideSpinnerAndShowPreview() {
			self.hideSpinner();
			self.$preview.show();
		}

		this.gateway.getPreview( params ).then( function ( result ) {
			var parsedText = result.text,
				parsedSectionLine = result.line;

			self.sectionId = result.id;
			// On desktop edit summaries strip tags. Mimic this behavior on mobile devices
			self.sectionLine = self.parseHTML( '<div>' ).html( parsedSectionLine ).text();
			new Section( {
				el: self.$preview,
				text: parsedText
			} ).$el.find( 'a' ).on( 'click', false );

			hideSpinnerAndShowPreview();
		}, function () {
			self.$preview.addClass( 'error' ).text( mw.msg( 'mobile-frontend-editor-error-preview' ) );

			hideSpinnerAndShowPreview();
		} );

		EditorOverlayBase.prototype.onStageChanges.apply( this, arguments );
	},

	/**
	 * Hides the preview and reverts back to initial screen.
	 * @memberof EditorOverlay
	 * @instance
	 * @private
	 */
	_hidePreview: function () {
		this.gateway.abortPreview();
		this.hideSpinner();
		this.$preview.removeClass( 'error' ).hide();
		this.$content.show();
		window.scrollTo( 0, this.scrollTop );
		this.showHidden( '.initial-header' );
		this.abuseFilterPanel.hide();
	},

	/**
	 * Resize the editor textarea, maintaining scroll position in iOS
	 * @memberof EditorOverlay
	 * @instance
	 */
	_resizeEditor: function () {
		var scrollTop, container, $scrollContainer;

		// exiting early for firefox due to a bug that causes the page to scroll to top
		// whenever a caret is inserted T214880
		if ( this.isFirefox ) {
			return;
		}

		if ( !this.$scrollContainer ) {
			container = OO.ui.Element.static
				.getClosestScrollableContainer( this.$content[ 0 ] );
			// The scroll container will be either within the view
			// or the document element itself.
			$scrollContainer = this.$el.find( container ).length ?
				this.$el.find( container ) : util.getDocument();
			this.$scrollContainer = $scrollContainer;
			this.$content.css( 'padding-bottom', this.$scrollContainer.height() * 0.6 );
		} else {
			$scrollContainer = this.$scrollContainer;
		}

		// Only do this if scroll container exists
		if ( this.$content.prop( 'scrollHeight' ) && $scrollContainer.length ) {
			scrollTop = $scrollContainer.scrollTop();
			this.$content
				.css( 'height', 'auto' )
				// can't reuse prop( 'scrollHeight' ) because we need the current value
				.css( 'height', ( this.$content.prop( 'scrollHeight' ) + 2 ) + 'px' );
			$scrollContainer.scrollTop( scrollTop );
		}
	},

	/**
	 * Set content to the user input field.
	 * @memberof EditorOverlay
	 * @instance
	 * @param {string} content The content to set.
	 */
	setContent: function ( content ) {
		this.$content
			.show()
			.val( content );
		this._resizeEditor();
	},

	/**
	 * Returns the content of the user input field.
	 * @memberof EditorOverlay
	 * @instance
	 * @return {string}
	 */
	getContent: function () {
		return this.$content.val();
	},

	/**
	 * @memberof EditorOverlay
	 * @instance
	 * @param {string} data
	 * @return {string|false}
	 */
	_parseBlockInfo: function ( data ) {
		var blockInfo, expiry, reason,
			moment = window.moment;

		// Workaround to parse a message parameter for mw.message, see T96885
		function jqueryMsgParse( wikitext ) {
			var parser, ast;
			// eslint-disable-next-line new-cap
			parser = new mw.jqueryMsg.parser();
			try {
				ast = parser.wikiTextToAst( wikitext );
				return parser.emitter.emit( ast ).html();
			} catch ( e ) {
				// Ignore error as it's probably the parser error. Usually this is because we
				// can't parse templates.
				return false;
			}
		}

		blockInfo = {
			partial: data.blockinfo.blockpartial || false,
			user: data.userinfo,
			creator: {
				name: data.blockinfo.blockedby,
				// NS_USER === 2
				url: mw.util.getUrl(
					mw.config.get( 'wgFormattedNamespaces' )[2] + ':' +
					data.blockinfo.blockedby
				)
			},
			expiry: null,
			duration: null,
			reason: '',
			blockId: data.blockinfo.blockid
		};

		expiry = data.blockinfo.blockexpiry;
		if ( [ 'infinite', 'indefinite', 'infinity', 'never' ].indexOf( expiry ) === -1 ) {
			blockInfo.expiry = moment( expiry ).format( 'LLL' );
			blockInfo.duration = moment().to( expiry, true );
		}

		reason = data.blockinfo.blockreason;
		if ( reason ) {
			blockInfo.reason = jqueryMsgParse( reason ) || mw.html.escape( reason );
		} else {
			blockInfo.reason = mw.message( 'mobile-frontend-editor-generic-block-reason' ).escaped();
		}

		return blockInfo;
	},

	/**
	 * Requests content from the API and reveals it in UI.
	 * @memberof EditorOverlay
	 * @instance
	 * @private
	 */
	_loadContent: function () {
		var self = this,
			$el = this.$el;

		this.$content.hide();
		this.showSpinner();
		$el.addClass( 'overlay-loading' );

		this.gateway.getContent()
			.then( function ( result ) {
				var block, message,
					content = result.text;

				self.setContent( content );
				// check if user is blocked
				if ( result.blockinfo ) {
					// Lazy-load moment only if it's needed,
					// it's somewhat large (it is already used on
					// mobile by Echo's notifications panel, where it's also lazy-loaded)
					mw.loader.using( 'moment' ).then( function () {
						block = self._parseBlockInfo( result );
						message = new BlockMessage( block );
						message.toggle();
						self.hide();
						self.hideSpinner();
						$el.removeClass( 'overlay-loading' );
					} );
				} else {
					self.hideSpinner();
					$el.removeClass( 'overlay-loading' );
				}
			}, function () {
				self.reportError( mw.msg( 'mobile-frontend-editor-error-loading' ) );
				$el.removeClass( 'overlay-loading' );
			} );
	},

	/**
	 * Loads a {VisualEditorOverlay} and replaces the existing EditorOverlay with it
	 * based on the current option values.
	 * @memberof EditorOverlay
	 * @instance
	 * @private
	 * @param {Object} options Object passed to the constructor
	 */
	_switchToVisualEditor: function ( options ) {
		var self = this;
		this.log( {
			action: 'abort',
			type: 'switchnochange',
			mechanism: 'navigate'
		} );
		// Save a user setting indicating that this user prefers using the VisualEditor
		mw.storage.set( 'preferredEditor', 'VisualEditor' );
		// Load the VisualEditor and replace the SourceEditor overlay with it
		this.showSpinner();
		this.$content.hide();
		mw.loader.using( 'ext.visualEditor.targetLoader' ).then( function () {
			mw.libs.ve.targetLoader.addPlugin( 'mobile.editor.ve' );
			return mw.libs.ve.targetLoader.loadModules( 'visual' );
		} ).then(
			function () {
				options.EditorOverlay = EditorOverlay;
				options.switched = true;
				self.hideSpinner();
				// Unset classes from other editor
				delete options.className;
				self.switching = true;
				self.overlayManager.replaceCurrent( new VisualEditorOverlay( options ) );
				self.switching = false;
			},
			function () {
				self.hideSpinner();
				self.$content.show();
				// FIXME: We should show an error notification, but right now toast
				// notifications are not dismissible when shown within the editor.
			}
		);
	},

	/**
	 * Reveals an abuse filter panel inside the view.
	 * @memberof EditorOverlay
	 * @instance
	 * @private
	 * @param {string} type The type of alert, e.g. 'warning' or 'disallow'
	 * @param {string} message Message to show in the AbuseFilter overlay
	 */
	_showAbuseFilter: function ( type, message ) {
		this.abuseFilterPanel.show( type, message );
		this.showHidden( '.save-header' );
		// disable continue and save buttons, reenabled when user changes content
		this.$el.find( '.continue, .submit' ).prop( 'disabled', this.abuseFilterPanel.isDisallowed );
	},

	/**
	 * Executed when the editor clicks the save/publish button. Handles logging and submitting
	 * the save action to the editor API.
	 * @inheritdoc
	 * @memberof EditorOverlay
	 * @instance
	 */
	onSaveBegin: function () {
		var self = this,
			options = {
				summary: this.$el.find( '.summary' ).val()
			};

		if ( self.sectionLine !== '' ) {
			options.summary = '/* ' + self.sectionLine + ' */' + options.summary;
		}
		EditorOverlayBase.prototype.onSaveBegin.apply( this, arguments );
		if ( this.confirmAborted ) {
			return;
		}
		if ( this.captchaId ) {
			options.captchaId = this.captchaId;
			options.captchaWord = this.$el.find( '.captcha-word' ).val();
		}

		this.showHidden( '.saving-header' );

		this.gateway.save( options )
			.then( function () {
				var title = self.options.title;
				// Special case behaviour of main page
				if ( mw.config.get( 'wgIsMainPage' ) ) {
					// FIXME: Blocked on T189173
					// eslint-disable-next-line no-restricted-properties
					window.location = mw.util.getUrl( title );
					return;
				}

				self.onSaveComplete();
			}, function ( data ) {
				self.onSaveFailure( data );
			} );
	},

	/**
	 * Executed when page save fails. Handles error display and bookkeeping,
	 * passes logging duties to the parent.
	 * @inheritdoc
	 * @memberof EditorOverlay
	 * @instance
	 */
	onSaveFailure: function ( data ) {
		var heading, msg;

		if ( data.type === 'captcha' ) {
			this.captchaId = data.details.id;
			this.handleCaptcha( data.details );
		} else if ( data.type === 'abusefilter' ) {
			this._showAbuseFilter( data.details.type, data.details.message );
		} else {
			msg = saveFailureMessage( data );
			if ( data.type === 'readonly' ) {
				heading = mw.msg( 'apierror-readonly' );
			}

			if ( msg || heading ) {
				this.reportError( msg, heading );
				this.showHidden( '.save-header, .save-panel' );
			}
		}

		EditorOverlayBase.prototype.onSaveFailure.apply( this, arguments );
	},

	/**
	 * Checks whether the existing content has changed.
	 * @memberof EditorOverlay
	 * @instance
	 * @return {boolean}
	 */
	hasChanged: function () {
		return this.gateway.hasChanged;
	}
} );

module.exports = EditorOverlay;
