var EditorOverlayBase = require( './EditorOverlayBase' ),
	util = require( '../mobile.startup/util' ),
	icons = require( '../mobile.startup/icons' ),
	Section = require( '../mobile.startup/Section' ),
	saveFailureMessage = require( './saveFailureMessage' ),
	EditorGateway = require( './EditorGateway' ),
	fakeToolbar = require( '../mobile.init/fakeToolbar' ),
	mfExtend = require( '../mobile.startup/mfExtend' ),
	setPreferredEditor = require( './setPreferredEditor' ),
	VisualEditorOverlay = require( './VisualEditorOverlay' );

/**
 * Overlay that shows an editor
 *
 * @class SourceEditorOverlay
 * @uses Section
 * @uses EditorGateway
 * @uses VisualEditorOverlay
 * @extends EditorOverlayBase
 *
 * @param {Object} options Configuration options
 * @param {Object} [options.visualEditorConfig] falls back to wgVisualEditorConfig if not defined
 * @param {jQuery.Promise} [dataPromise] Optional promise for loading content
 */
function SourceEditorOverlay( options, dataPromise ) {
	this.isFirefox = /firefox/i.test( window.navigator.userAgent );
	this.visualEditorConfig = options.visualEditorConfig ||
		mw.config.get( 'wgVisualEditorConfig' ) || {};
	this.gateway = new EditorGateway( {
		api: options.api,
		title: options.title,
		sectionId: options.sectionId,
		oldId: options.oldId,
		isNewPage: options.isNewPage,
		fromModified: !!dataPromise
	} );
	this.readOnly = !!options.oldId; // If old revision, readOnly mode
	this.dataPromise = dataPromise || this.gateway.getContent();
	if ( this.isVisualEditorEnabled() ) {
		options.editSwitcher = true;
	}
	if ( this.readOnly ) {
		options.readOnly = true;
		options.editingMsg = mw.msg( 'mobile-frontend-editor-viewing-source-page', options.title );
	} else {
		options.editingMsg = mw.msg( 'mobile-frontend-editor-editing-page', options.title );
	}
	options.previewingMsg = mw.msg( 'mobile-frontend-editor-previewing-page', options.title );
	EditorOverlayBase.call(
		this,
		util.extend( true,
			{ events: { 'input .wikitext-editor': 'onInputWikitextEditor' } },
			options
		)
	);
}

mfExtend( SourceEditorOverlay, EditorOverlayBase, {
	/**
	 * @inheritdoc
	 * @memberof SourceEditorOverlay
	 * @instance
	 */
	templatePartials: util.extend( {}, EditorOverlayBase.prototype.templatePartials, {
		content: util.template( `
<div lang="{{contentLang}}" dir="{{contentDir}}" class="editor-container content">
	<textarea class="wikitext-editor" id="wikitext-editor" cols="40" rows="10" placeholder="{{placeholder}}"></textarea>
	<div class="preview"></div>
</div>
		` )
	} ),
	/**
	 * @memberof SourceEditorOverlay
	 * @instance
	 */
	editor: 'wikitext',
	/**
	 * @memberof SourceEditorOverlay
	 * @instance
	 */
	sectionLine: '',

	/**
	 * @inheritdoc
	 * @memberof SourceEditorOverlay
	 * @instance
	 */
	show: function () {
		EditorOverlayBase.prototype.show.apply( this, arguments );
		// Ensure we do this after showing the overlay, otherwise it doesn't work.
		this._resizeEditor();
	},
	/**
	 * Check whether VisualEditor is enabled or not.
	 *
	 * @memberof SourceEditorOverlay
	 * @instance
	 * @return {boolean}
	 */
	isVisualEditorEnabled: function () {
		var config = this.visualEditorConfig,
			ns = config.namespaces;

		return ns &&
			ns.indexOf(
				mw.config.get( 'wgNamespaceNumber' )
			) > -1 &&
			mw.config.get( 'wgTranslatePageTranslation' ) !== 'translation' &&
			mw.config.get( 'wgPageContentModel' ) === 'wikitext';
	},
	/**
	 * Wikitext Editor input handler
	 *
	 * @memberof SourceEditorOverlay
	 * @instance
	 */
	onInputWikitextEditor: function () {
		this.gateway.setContent( this.$el.find( '.wikitext-editor' ).val() );
		this.$el.find( '.continue, .submit' ).prop( 'disabled', false );
	},
	/**
	 * @inheritdoc
	 * @memberof SourceEditorOverlay
	 * @instance
	 */
	onClickBack: function () {
		EditorOverlayBase.prototype.onClickBack.apply( this, arguments );
		this._hidePreview();
	},
	/**
	 * @inheritdoc
	 * @memberof SourceEditorOverlay
	 * @instance
	 */
	postRender: function () {
		var self = this,
			config = this.visualEditorConfig,
			options = this.options,
			showAnonWarning = options.isAnon && !options.switched;

		// log edit attempt
		this.log( { action: 'ready' } );
		this.log( { action: 'loaded' } );

		if ( this.isVisualEditorEnabled() ) {
			mw.loader.using( 'ext.visualEditor.switching' ).then( function () {
				var switchToolbar, windowManager, switchWindow,
					toolFactory = new OO.ui.ToolFactory(),
					toolGroupFactory = new OO.ui.ToolGroupFactory();

				toolFactory.register( mw.libs.ve.MWEditModeVisualTool );
				toolFactory.register( mw.libs.ve.MWEditModeSourceTool );
				switchToolbar = new OO.ui.Toolbar( toolFactory, toolGroupFactory, {
					classes: [ 'editor-switcher' ]
				} );

				switchToolbar.on( 'switchEditor', function ( mode ) {
					var
						canSwitch = config.fullRestbaseUrl || config.allowLossySwitching;
					if ( mode === 'visual' ) {
						if ( !self.gateway.hasChanged ) {
							self._switchToVisualEditor();
						} else if ( canSwitch ) {
							// Pass wikitext if there are changes.
							self._switchToVisualEditor( self.gateway.content );
						} else {
							windowManager = new OO.ui.WindowManager();
							switchWindow = new mw.libs.ve.SwitchConfirmDialog();
							windowManager.$element.appendTo( document.body );
							windowManager.addWindows( [ switchWindow ] );
							windowManager.openWindow( switchWindow, { mode: 'simple' } )
								.closed.then( function ( data ) {
									if ( data && data.action === 'discard' ) {
										self._switchToVisualEditor();
									}
									windowManager.destroy();
								} );
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

		// This spinner is still used when displaying save/preview panel
		this.$el.find( '.overlay-content' ).append( icons.spinner().$el );
		this.hideSpinner();

		this.$preview = this.$el.find( '.preview' );
		this.$content = this.$el.find( '.wikitext-editor' );
		// The following classes can be used here:
		// * mw-editfont-monospace
		// * mw-editfont-sans-serif
		// * mw-editfont-serif
		this.$content.addClass( 'mw-editfont-' + mw.user.options.get( 'editfont' ) );
		if ( showAnonWarning ) {
			this.$anonWarning = this.createAnonWarning( options );
			this.$el.find( '.editor-container' ).append( this.$anonWarning );
			this.$content.hide();
			// the user has to click login, signup or edit without login,
			// disable "Next" button on top right
			this.$anonHiddenButtons = this.$el.find( '.overlay-header .continue, .editor-switcher' ).hide();
		}
		// make license links open in separate tabs
		this.$el.find( '.license a' ).attr( 'target', '_blank' );

		// If in readOnly mode, make textarea readonly
		if ( this.readOnly ) {
			this.$content.prop( 'readonly', true );
		}

		this.$content
			.on( 'input', this._resizeEditor.bind( this ) )
			.one( 'input', function () {
				self.log( { action: 'firstChange' } );
			} );

		if ( this.isFirefox ) {
			this.$content.on( 'mousedown', function () {
				// Support: Firefox Mobile
				// Firefox scrolls back to the top of the page *every time*
				// you tap on the textarea. This makes things slightly
				// more usable by restoring your scroll offset every time
				// the page scrolls for the next 1000ms.
				// The page will still flicker every time the user touches
				// to place the cursor, but this is better than completely
				// losing your scroll offset. (T214880)
				var docEl = document.documentElement,
					scrollTop = docEl.scrollTop;
				function blockScroll() {
					docEl.scrollTop = scrollTop;
				}
				window.addEventListener( 'scroll', blockScroll );
				setTimeout( function () {
					window.removeEventListener( 'scroll', blockScroll );
				}, 1000 );
			} );
		}

		if ( !showAnonWarning ) {
			this._loadContent();
		}
	},

	/**
	 * Handles click on "Edit without login" in anonymous editing warning.
	 *
	 * @memberof SourceEditorOverlay
	 * @instance
	 * @private
	 */
	onClickAnonymous: function () {
		this.$anonWarning.hide();
		// reenable "Next" button
		this.$anonHiddenButtons.show();
		this._loadContent();
	},

	/**
	 * Prepares the preview interface and reveals the save screen of the overlay
	 *
	 * @inheritdoc
	 * @memberof SourceEditorOverlay
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
			self.$preview.addClass( 'errorbox' ).text( mw.msg( 'mobile-frontend-editor-error-preview' ) );

			hideSpinnerAndShowPreview();
		} );

		EditorOverlayBase.prototype.onStageChanges.apply( this, arguments );
	},

	/**
	 * Hides the preview and reverts back to initial screen.
	 *
	 * @memberof SourceEditorOverlay
	 * @instance
	 * @private
	 */
	_hidePreview: function () {
		this.gateway.abortPreview();
		this.hideSpinner();
		this.$preview.removeClass( 'errorbox' ).hide();
		this.$content.show();
		window.scrollTo( 0, this.scrollTop );
		this.showHidden( '.initial-header' );
	},

	/**
	 * Resize the editor textarea, maintaining scroll position in iOS
	 *
	 * @memberof SourceEditorOverlay
	 * @instance
	 */
	_resizeEditor: function () {
		var scrollTop, container, $scrollContainer;

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
	 *
	 * @memberof SourceEditorOverlay
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
	 *
	 * @memberof SourceEditorOverlay
	 * @instance
	 * @return {string}
	 */
	getContent: function () {
		return this.$content.val();
	},

	/**
	 * Requests content from the API and reveals it in UI.
	 *
	 * @memberof SourceEditorOverlay
	 * @instance
	 * @private
	 */
	_loadContent: function () {
		var self = this;

		this.$content.hide();

		this.getLoadingPromise()
			.then( function ( result ) {
				var content = result.text;

				self.setContent( content );

				if ( self.gateway.fromModified ) {
					// Trigger intial EditorGateway#setContent and update save button
					self.onInputWikitextEditor();
				}
			} );
	},

	/**
	 * Loads a {VisualEditorOverlay} and replaces the existing SourceEditorOverlay with it
	 * based on the current option values.
	 *
	 * @memberof SourceEditorOverlay
	 * @instance
	 * @private
	 * @param {string} [wikitext] Wikitext to pass to VE
	 */
	_switchToVisualEditor: function ( wikitext ) {
		var self = this;
		this.log( {
			action: 'abort',
			type: 'switchnochange',
			mechanism: 'navigate'
		} );
		this.logFeatureUse( {
			feature: 'editor-switch',
			action: 'visual-mobile'
		} );

		// Save a user setting indicating that this user prefers using the VisualEditor
		setPreferredEditor( 'VisualEditor' );

		this.$el.addClass( 'switching' );
		this.$el.find( '.overlay-header-container' ).hide();
		this.$el.append( fakeToolbar() );
		this.$content.prop( 'readonly', true );

		mw.loader.using( 'ext.visualEditor.targetLoader' ).then( function () {
			mw.libs.ve.targetLoader.addPlugin( 'mobile.editor.ve' );
			return mw.libs.ve.targetLoader.loadModules( 'visual' );
		} ).then(
			function () {
				var newOverlay, options = self.getOptionsForSwitch();
				options.SourceEditorOverlay = SourceEditorOverlay;
				if ( wikitext ) {
					options.dataPromise = mw.libs.ve.targetLoader.requestPageData( 'visual', mw.config.get( 'wgRelevantPageName' ), {
						section: options.sectionId,
						oldId: options.oldId || mw.config.get( 'wgRevisionId' ),
						targetName: 'mobile',
						modified: true,
						wikitext: wikitext
					} );
				} else {
					delete options.dataPromise;
				}
				newOverlay = new VisualEditorOverlay( options );
				newOverlay.getLoadingPromise().then( function () {
					self.switching = true;
					self.overlayManager.replaceCurrent( newOverlay );
					self.switching = false;
				} );
			},
			function () {
				self.$el.removeClass( 'switching' );
				self.$el.find( '.overlay-header-container' ).show();
				self.$el.find( '.ve-mobile-fakeToolbar-container' ).remove();
				self.$content.prop( 'readonly', false );
				// FIXME: We should show an error notification, but right now toast
				// notifications are not dismissible when shown within the editor.
			}
		);
	},

	/**
	 * Executed when the editor clicks the save/publish button. Handles logging and submitting
	 * the save action to the editor API.
	 *
	 * @inheritdoc
	 * @memberof SourceEditorOverlay
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
			.then( function ( newRevId ) {
				var title = self.options.title;
				// Special case behaviour of main page
				if ( mw.config.get( 'wgIsMainPage' ) ) {
					// FIXME: Blocked on T189173
					// eslint-disable-next-line no-restricted-properties
					window.location = mw.util.getUrl( title );
					return;
				}

				self.onSaveComplete( newRevId );
			}, function ( data ) {
				self.onSaveFailure( data );
			} );
	},

	/**
	 * Executed when page save fails. Handles error display and bookkeeping,
	 * passes logging duties to the parent.
	 *
	 * @inheritdoc
	 * @memberof SourceEditorOverlay
	 * @instance
	 */
	onSaveFailure: function ( data ) {
		var msg, noRetry;

		if ( data.edit && data.edit.captcha ) {
			this.captchaId = data.edit.captcha.id;
			this.handleCaptcha( data.edit.captcha );
		} else {
			msg = saveFailureMessage( data );
			this.reportError( msg );
			this.showHidden( '.save-header, .save-panel' );

			// Some errors may be temporary, but for others we know for sure that the save will
			// never succeed, so don't confuse the user by giving them the option to retry.
			noRetry = data.errors && data.errors.some( function ( error ) {
				return error.code === 'abusefilter-disallowed';
			} );

			if ( noRetry ) {
				// disable continue and save buttons, reenabled when user changes content
				this.$el.find( '.continue, .submit' ).prop( 'disabled', true );
			}
		}

		EditorOverlayBase.prototype.onSaveFailure.apply( this, arguments );
	},

	/**
	 * Checks whether the existing content has changed.
	 *
	 * @memberof SourceEditorOverlay
	 * @instance
	 * @return {boolean}
	 */
	hasChanged: function () {
		return this.gateway.hasChanged;
	}
} );

module.exports = SourceEditorOverlay;
