const mobile = require( 'mobile.startup' ),
	EditorOverlayBase = require( './EditorOverlayBase.js' ),
	util = mobile.util,
	spinner = mobile.spinner,
	Section = mobile.Section,
	saveFailureMessage = require( './saveFailureMessage.js' ),
	EditorGateway = require( './EditorGateway.js' ),
	MessageBox = mobile.MessageBox,
	setPreferredEditor = require( './setPreferredEditor.js' ),
	VisualEditorOverlay = require( './VisualEditorOverlay.js' ),
	currentPage = mobile.currentPage;

/**
 * Overlay that shows an editor
 *
 * @uses Section
 * @uses EditorGateway
 * @uses VisualEditorOverlay
 * @private
 */
class SourceEditorOverlay extends EditorOverlayBase {
	/**
	 * @param {Object} options Configuration options
	 * @param {jQuery.Promise} [dataPromise] Optional promise for loading content
	 */
	constructor( options, dataPromise ) {
		super(
			util.extend( true,
				{ events: { 'input .wikitext-editor': 'onInputWikitextEditor' } },
				options,
				{ dataPromise }
			)
		);
	}

	initialize( options ) {
		this.isFirefox = /firefox/i.test( window.navigator.userAgent );
		this.gateway = new EditorGateway( {
			api: options.api,
			title: options.title,
			sectionId: options.sectionId,
			oldId: options.oldId,
			fromModified: !!options.dataPromise,
			preload: options.preload,
			preloadparams: options.preloadparams,
			editintro: options.editintro
		} );
		this.readOnly = !!options.oldId; // If old revision, readOnly mode
		this.dataPromise = options.dataPromise || this.gateway.getContent();
		this.currentPage = currentPage();
		if ( this.currentPage.isVEVisualAvailable() ) {
			options.editSwitcher = true;
		}
		if ( this.readOnly ) {
			options.readOnly = true;
			options.editingMsg = mw.msg( 'mobile-frontend-editor-viewing-source-page', options.title );
		} else {
			options.editingMsg = mw.msg( 'mobile-frontend-editor-editing-page', options.title );
		}
		options.previewingMsg = mw.msg( 'mobile-frontend-editor-previewing-page', options.title );
		this.sectionLine = '';
		super.initialize( options );
	}

	get editor() {
		return 'wikitext';
	}

	/**
	 * @inheritdoc
	 */
	get templatePartials() {
		return util.extend(
			{},
			super.templatePartials, {
				content: util.template( `
		<div lang="{{contentLang}}" dir="{{contentDir}}" class="editor-container content">
			<textarea class="wikitext-editor" id="wikitext-editor" cols="40" rows="10" placeholder="{{placeholder}}"></textarea>
			<div class="preview collapsible-headings-expanded mw-body-content"></div>
		</div>
				` )
			}
		);
	}

	/**
	 * @inheritdoc
	 */
	show() {
		super.show();
		// Ensure we do this after showing the overlay, otherwise it doesn't work.
		this._resizeEditor();
	}

	/**
	 * Wikitext Editor input handler
	 *
	 */
	onInputWikitextEditor() {
		this.gateway.setContent( this.$el.find( '.wikitext-editor' ).val() );
		this.$el.find( '.continue, .submit' ).prop( 'disabled', false );
	}

	/**
	 * @inheritdoc
	 */
	onClickBack() {
		super.onClickBack();
		this._hidePreview();
	}

	/**
	 * @inheritdoc
	 */
	postRender() {
		// log edit attempt
		this.log( { action: 'ready' } );
		this.log( { action: 'loaded' } );

		if ( this.currentPage.isVEVisualAvailable() ) {
			mw.loader.using( 'ext.visualEditor.switching' ).then( () => {
				const toolFactory = new OO.ui.ToolFactory(),
					toolGroupFactory = new OO.ui.ToolGroupFactory();

				toolFactory.register( mw.libs.ve.MWEditModeVisualTool );
				toolFactory.register( mw.libs.ve.MWEditModeSourceTool );
				const switchToolbar = new OO.ui.Toolbar( toolFactory, toolGroupFactory, {
					classes: [ 'editor-switcher' ]
				} );

				switchToolbar.on( 'switchEditor', ( mode ) => {
					if ( mode === 'visual' ) {
						if ( !this.gateway.hasChanged ) {
							this._switchToVisualEditor();
						} else {
							// Pass wikitext if there are changes.
							this._switchToVisualEditor( this.gateway.content );
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

				this.$el.find( '.switcher-container' ).html( switchToolbar.$element );
				switchToolbar.emit( 'updateState' );
			} );
		}

		super.postRender();

		// This spinner is still used when displaying save/preview panel
		this.$el.find( '.overlay-content' ).append( spinner().$el );
		this.hideSpinner();

		this.$preview = this.$el.find( '.preview' );
		this.$content = this.$el.find( '.wikitext-editor' );
		// The following classes can be used here:
		// * mw-editfont-monospace
		// * mw-editfont-sans-serif
		// * mw-editfont-serif
		this.$content.addClass( 'mw-editfont-' + mw.user.options.get( 'editfont' ) );

		// make license links open in separate tabs
		this.$el.find( '.license a' ).attr( 'target', '_blank' );

		// If in readOnly mode, make textarea readonly
		if ( this.readOnly ) {
			this.$content.prop( 'readonly', true );
		}

		this.$content
			.on( 'input', () => this._resizeEditor() )
			.one( 'input', () => {
				this.log( { action: 'firstChange' } );
			} );

		if ( this.isFirefox ) {
			this.$content.on( 'mousedown', () => {
				// Support: Firefox Mobile
				// Firefox scrolls back to the top of the page *every time*
				// you tap on the textarea. This makes things slightly
				// more usable by restoring your scroll offset every time
				// the page scrolls for the next 1000ms.
				// The page will still flicker every time the user touches
				// to place the cursor, but this is better than completely
				// losing your scroll offset. (T214880)
				const docEl = document.documentElement,
					scrollTop = docEl.scrollTop;
				function blockScroll() {
					docEl.scrollTop = scrollTop;
				}
				window.addEventListener( 'scroll', blockScroll );
				setTimeout( () => {
					window.removeEventListener( 'scroll', blockScroll );
				}, 1000 );
			} );
		}

		// Render edit summary
		this.summaryTextArea = new OO.ui.MultilineTextInputWidget( {
			placeholder: this.options.summaryMsg,
			classes: [ 'summary' ],
			value: '',
			maxRows: 2
		} );
		this.$el.find( '.summary-input' ).append(
			this.summaryTextArea.$element
		);

		this._loadContent();
	}

	/**
	 * Handles click on "Edit without login" in anonymous editing warning.
	 *
	 * @private
	 */
	onClickAnonymous() {
		this.$anonWarning.hide();
		this.$anonTalkWarning.hide();
		// reenable "Next" button
		this.$anonHiddenButtons.show();
		this.$content.show();
		this._resizeEditor();
	}

	/**
	 * Prepares the preview interface and reveals the save screen of the overlay
	 *
	 * @inheritdoc
	 */
	onStageChanges() {
		const params = {
			text: this.getContent()
		};

		this.scrollTop = util.getDocument().find( 'body' ).scrollTop();
		this.$content.hide();
		this.showSpinner();

		if ( mw.config.get( 'wgIsMainPage' ) ) {
			params.mainpage = 1; // Setting it to 0 will have the same effect
		}

		const hideSpinnerAndShowPreview = () => {
			this.hideSpinner();
			this.$preview.show();
			mw.hook( 'wikipage.content' ).fire( this.$preview );
		};

		this.gateway.getPreview( params ).then( ( result ) => {
			const parsedText = result.text,
				parsedSectionLine = result.line;

			this.sectionId = result.id;
			// On desktop edit summaries strip tags. Mimic this behavior on mobile devices
			this.sectionLine = this.parseHTML( '<div>' ).html( parsedSectionLine ).text();
			new Section( {
				el: this.$preview,
				text: parsedText
			} ).$el.find( 'a' ).on( 'click', false );

			hideSpinnerAndShowPreview();
		}, () => {
			this.$preview.replaceWith(
				new MessageBox( {
					type: 'error',
					msg: mw.msg( 'mobile-frontend-editor-error-preview' )
				} ).$el
			);
			hideSpinnerAndShowPreview();
		} );

		super.onStageChanges();
	}

	/**
	 * Hides the preview and reverts back to initial screen.
	 *
	 * @private
	 */
	_hidePreview() {
		this.gateway.abortPreview();
		this.hideSpinner();
		// FIXME: Don't rely on internals - we re-render template instead.
		this.$preview.removeClass(
			'cdx-message--error'
		).hide();
		this.$content.show();
		window.scrollTo( 0, this.scrollTop );
		this.showHidden( '.initial-header' );
	}

	/**
	 * Resize the editor textarea, maintaining scroll position in iOS
	 *
	 */
	_resizeEditor() {
		let scrollTop, container, $scrollContainer;

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
	}

	/**
	 * Set content to the user input field.
	 *
	 * @param {string} content The content to set.
	 */
	setContent( content ) {
		this.$content
			.show()
			.val( content );
		this._resizeEditor();
	}

	/**
	 * Returns the content of the user input field.
	 *
	 * @return {string}
	 */
	getContent() {
		return this.$content.val();
	}

	/**
	 * Requests content from the API and reveals it in UI.
	 *
	 * @private
	 */
	_loadContent() {
		this.$content.hide();

		this.getLoadingPromise()
			.then( ( result ) => {
				const content = result.text;

				this.setContent( content );

				// If the loaded content is not the default content, enable the save button
				if ( this.hasChanged() ) {
					this.$el.find( '.continue, .submit' ).prop( 'disabled', false );
				}

				const options = this.options;
				const showAnonWarning = options.isAnon && !options.switched;

				if ( showAnonWarning ) {
					this.$anonWarning = this.createAnonWarning( options );
					this.$anonTalkWarning = this.createAnonTalkWarning();
					this.$el.find( '.editor-container' ).append( [ this.$anonTalkWarning, this.$anonWarning ] );
					this.$content.hide();
					// the user has to click login, signup or edit without login,
					// disable "Next" button on top right
					this.$anonHiddenButtons = this.$el.find( '.overlay-header .continue' ).hide();
				}

				if ( this.gateway.fromModified ) {
					// Trigger intial EditorGateway#setContent and update save button
					this.onInputWikitextEditor();
				}

				this.showEditNotices();
			} );
	}

	/**
	 * Loads a {VisualEditorOverlay} and replaces the existing SourceEditorOverlay with it
	 * based on the current option values.
	 *
	 * @private
	 * @param {string} [wikitext] Wikitext to pass to VE
	 */
	_switchToVisualEditor( wikitext ) {
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
		this.$el.append( this.fakeToolbar() );
		this.$content.prop( 'readonly', true );

		mw.loader.using( 'ext.visualEditor.targetLoader' ).then( () => {
			mw.libs.ve.targetLoader.addPlugin( 'ext.visualEditor.mobileArticleTarget' );
			return mw.libs.ve.targetLoader.loadModules( 'visual' );
		} ).then(
			() => {
				const options = this.getOptionsForSwitch();
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

				const newOverlay = new VisualEditorOverlay( options );
				newOverlay.getLoadingPromise().then( () => {
					this.switching = true;
					this.overlayManager.replaceCurrent( newOverlay );
					this.switching = false;
				} );
			},
			() => {
				this.$el.removeClass( 'switching' );
				this.$el.find( '.overlay-header-container' ).show();
				this.$el.find( '.ve-mobile-fakeToolbar-container' ).remove();
				this.$content.prop( 'readonly', false );
				// FIXME: We should show an error notification, but right now toast
				// notifications are not dismissible when shown within the editor.
			}
		);
	}

	/**
	 * Get the current edit summary.
	 *
	 * @return {string}
	 */
	getEditSummary() {
		return this.summaryTextArea.getValue();
	}

	/**
	 * Executed when the editor clicks the save/publish button. Handles logging and submitting
	 * the save action to the editor API.
	 *
	 * @inheritdoc
	 */
	onSaveBegin() {
		const options = {
			summary: this.getEditSummary()
		};

		if ( this.sectionLine !== '' ) {
			options.summary = '/* ' + this.sectionLine + ' */' + options.summary;
		}
		super.onSaveBegin();
		if ( this.confirmAborted ) {
			return;
		}
		if ( this.captchaId ) {
			options.captchaId = this.captchaId;
			options.captchaWord = this.$el.find( '.captcha-word' ).val();
		}

		this.showHidden( '.saving-header' );

		this.gateway.save( options )
			.then( ( newRevId, redirectUrl, tempUserCreated ) => {
				const title = this.options.title;
				// Special case behaviour of main page
				if ( mw.config.get( 'wgIsMainPage' ) && !redirectUrl ) {
					// FIXME: Blocked on T189173
					// eslint-disable-next-line no-restricted-properties
					window.location = mw.util.getUrl( title );
					return;
				}

				this.onSaveComplete( newRevId, redirectUrl, tempUserCreated );

				if ( redirectUrl && tempUserCreated ) {
					// eslint-disable-next-line no-restricted-properties
					window.location.href = redirectUrl;
				}
			}, ( data ) => {
				this.onSaveFailure( data );
			} );
	}

	/**
	 * @inheritdoc
	 * @param {number|null} newRevId ID of the newly created revision, or null if it was a
	 * null edit.
	 * @param {string} [redirectUrl] URL to redirect to, if different than the current URL.
	 * @param {boolean} [tempUserCreated] Whether a temporary user was created
	 */
	onSaveComplete( newRevId, redirectUrl, tempUserCreated ) {
		super.onSaveComplete( newRevId, redirectUrl, tempUserCreated );

		// The parent class changes the location hash in a setTimeout, so wait
		// for that to happen before reloading.
		setTimeout( function () {
			if ( redirectUrl ) {
				// eslint-disable-next-line no-restricted-properties
				window.location.href = redirectUrl;
			} else if ( newRevId ) {
				// Set a notify parameter similar to venotify in VisualEditor.
				const url = new URL( location.href );
				url.searchParams.set( 'mfnotify', this.isNewPage ? 'created' : 'saved' );
				// eslint-disable-next-line no-restricted-properties
				window.location.search = url.search;
			} else {
				// Null edit; do not add notify parameter.
				// Note the "#" may be in the URL.
				// If so, using window.location alone will not reload the page
				// we need to forcefully refresh
				// eslint-disable-next-line no-restricted-properties
				window.location.reload();
			}
		} );
	}

	/**
	 * @inheritdoc
	 */
	showSaveCompleteMsg( action, tempUserCreated ) {
		require( 'mediawiki.action.view.postEdit' ).fireHookOnPageReload( action, tempUserCreated );
	}

	/**
	 * Executed when page save fails. Handles error display and bookkeeping,
	 * passes logging duties to the parent.
	 *
	 * @inheritdoc
	 */
	onSaveFailure( data ) {
		let msg, noRetry;

		if ( data.edit && data.edit.captcha ) {
			this.captchaId = data.edit.captcha.id;
			this.handleCaptcha( data.edit.captcha );
		} else {
			msg = saveFailureMessage( data );
			this.reportError( msg );
			this.showHidden( '.save-header, .save-panel' );

			// Some errors may be temporary, but for others we know for sure that the save will
			// never succeed, so don't confuse the user by giving them the option to retry.
			noRetry = data.errors && data.errors.some( ( error ) => error.code === 'abusefilter-disallowed' );

			if ( noRetry ) {
				// disable continue and save buttons, reenabled when user changes content
				this.$el.find( '.continue, .submit' ).prop( 'disabled', true );
			}
		}

		super.onSaveFailure( data );
	}

	/**
	 * Checks whether the existing content has changed.
	 *
	 * @return {boolean}
	 */
	hasChanged() {
		return this.gateway.hasChanged;
	}
}

module.exports = SourceEditorOverlay;
