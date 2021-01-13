var
	user = mw.user,
	icons = require( '../mobile.startup/icons' ),
	$spinner = icons.spinner().$el,
	mfExtend = require( '../mobile.startup/mfExtend' ),
	Overlay = require( '../mobile.startup/Overlay' ),
	header = require( '../mobile.startup/headers' ).header,
	util = require( '../mobile.startup/util' ),
	autosign = require( './autosign' ),
	Button = require( '../mobile.startup/Button' ),
	lazyImageLoader = require( '../mobile.startup/lazyImages/lazyImageLoader' );

/**
 * Callback executed when a save has successfully completed.
 *
 * @callback onSaveComplete
 */

/**
 * Overlay for showing talk page section
 *
 * @class TalkSectionOverlay
 * @extends Overlay
 * @param {Object} options
 * @param {number} options.id Section ID
 * @param {Section} options.section
 * @param {mw.Api} options.api
 * @param {string} options.title
 * @param {string} options.licenseMsg
 * @param {onSaveComplete} [options.onSaveComplete]
 */
function TalkSectionOverlay( options ) {
	const onBeforeExit = this.onBeforeExit.bind( this );

	this.editorApi = options.api;
	this.state = {
		// current value of the textarea
		text: ''
	};
	Overlay.call( this,
		util.extend( true, options, {
			className: 'talk-overlay overlay',
			onBeforeExit,
			events: {
				click: function ( ev ) {
					// If a link has been clicked (that's not the save button)
					// check that it's okay to exit
					if ( ev.target.tagName === 'BUTTON' &&
						ev.target.className.indexOf( 'save-button' ) === -1
					) {
						// If the user says okay, do nothing, continuing as if normal link
						onBeforeExit( () => {}, function () {
							// if the user says no, prevent the default behaviour
							ev.preventDefault();
						} );
					}
				},
				'input textarea': 'onInputTextarea',
				'click .save-button': 'onSaveClick'
			}
		} )
	);
}

mfExtend( TalkSectionOverlay, Overlay, {
	templatePartials: util.extend( {}, Overlay.prototype.templatePartials, {
		content: util.template( `
<div class="content talk-section mw-parser-output">
	{{{section.text}}}
	<div class="comment">
		<div class="list-header">{{reply}}</div>
		<div class="comment-content">
			<textarea class="wikitext-editor"></textarea>
			<p class="license">
				{{info}}
				{{{licenseMsg}}}
			</p>
		</div>
	</div>
</div>
		` )
	} ),
	/**
	 * @memberof TalkSectionOverlay
	 * @instance
	 * @mixes Overlay#defaults
	 * @property {Object} defaults Default options hash.
	 * @property {string} defaults.title Title.
	 * @property {Section} defaults.section that is currently being viewed in overlay.
	 * @property {string} defaults.reply Reply heading.
	 * @property {Button} defaults.saveButton
	 * @property {string} defaults.info Message that informs the user their talk reply will be
	 * automatically signed.
	 */
	defaults: util.extend( {}, Overlay.prototype.defaults, {
		saveButton: new Button( {
			block: true,
			tagName: 'button',
			disabled: true,
			additionalClassNames: 'save-button',
			progressive: true,
			label: util.saveButtonMessage()
		} ),
		title: undefined,
		section: undefined,
		reply: mw.msg( 'mobile-frontend-talk-reply' ),
		info: mw.msg( 'mobile-frontend-talk-reply-info' )
	} ),
	/**
	 * A function to run before exiting the overlay
	 *
	 * @memberof TalkSectionOverlay
	 * @instance
	 * @param {Event} ev
	 */
	onInputTextarea: function ( ev ) {
		var value = ev.target.value;
		this.state.text = value;
		if ( value ) {
			this.$saveButton.prop( 'disabled', false );
		} else {
			this.$saveButton.prop( 'disabled', true );
		}
	},
	/**
	 * A function to run before exiting the overlay
	 *
	 * @memberof TalkSectionOverlay
	 * @instance
	 * @param {Function} exit
	 * @param {Function} cancel
	 */
	onBeforeExit: function ( exit, cancel ) {
		var confirmMessage = mw.msg( 'mobile-frontend-editor-cancel-confirm' );

		// eslint-disable-next-line no-alert
		if ( !this.state.text || window.confirm( confirmMessage ) ) {
			exit();
		} else {
			cancel();
		}
	},
	/**
	 * Accounts for the fact sections are loaded asynchronously and sets the headers
	 * for the overlay
	 *
	 * @inheritdoc
	 */
	preRender: function () {
		var options = this.options;
		this.options.headers = [
			header(
				options.section ? options.section.line : '',
				[],
				icons.back(),
				'initial-header'
			)
		];
	},
	/**
	 * Fetches the talk topics of the page specified in options.title
	 * if options.section is not defined.
	 *
	 * @inheritdoc
	 * @memberof TalkSectionOverlay
	 * @instance
	 */
	postRender: function () {
		lazyImageLoader.loadImages(
			lazyImageLoader.queryPlaceholders( this.$el[0] )
		);
		Overlay.prototype.postRender.apply( this );
		this.$el.find( '.talk-section' ).prepend( $spinner );
		this.$saveButton = this.options.saveButton.$el;
		this.$el.find( '.comment-content' ).append( this.$saveButton );
		this.hideSpinner();
		this._enableComments();
	},
	/**
	 * Enables comments on the current rendered talk topic
	 *
	 * @memberof TalkSectionOverlay
	 * @instance
	 * @private
	 */
	_enableComments: function () {
		this.$commentBox = this.$el.find( '.comment' );
		if ( user.isAnon() ) {
			this.$commentBox.remove();
		} else {
			this.$textarea = this.$commentBox.find( 'textarea' );
		}
	},
	/**
	 * Handle a click on the save button
	 *
	 * @memberof TalkSectionOverlay
	 * @instance
	 */
	onSaveClick: function () {
		var val = this.state.text,
			self = this;

		function enableSaveButton() {
			self.$saveButton.prop( 'disabled', false );
		}
		if ( val ) {
			// show a spinner
			this.showSpinner();
			this.$saveButton.prop( 'disabled', true );
			// sign and add newline to front
			val = '\n\n' + autosign( val );
			// FIXME: This should be using a gateway
			// e.g. TalkGateway, PageGateway or EditorGateway
			this.editorApi.postWithToken( 'csrf', {
				action: 'edit',
				title: this.options.title,
				section: this.options.id,
				appendtext: val,
				redirect: true
			} ).then( function () {
				if ( self.options.onSaveComplete ) {
					self.options.onSaveComplete();
				}
			}, function ( data, response ) {
				// FIXME: Code sharing with SourceEditorOverlay?
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
				mw.notify( msg, { type: 'error' } );
				enableSaveButton();
			} );
		}
	}
} );

module.exports = TalkSectionOverlay;
