( function ( M, $ ) {

	var ErrorReportOverlay,
		Overlay = M.require( 'Overlay' ),
		api = M.require( 'api' ),
		toast = M.require( 'toast' );

	/**
	 * @class ErrorReportOverlay
	 * @extends Overlay
	 */
	ErrorReportOverlay = Overlay.extend( {
		/**
		 * @inheritdoc
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {String} defaults.heading Title of the error reporting interface
		 * @cfg {String} defaults.placeHolder Placeholder text for error field
		 * @cfg {String} defaults.instructions Instructions about how to use the form
		 * @cfg {String} defaults.licenseMsg Licensing notice
		 * FIXME: move messages to i18n once copy is approved
		 */
		defaults: {
			heading: mw.msg( 'mobile-frontend-errorreport-heading' ),
			headerButtonsListClassName: 'overlay-action',
			headerButtons: [ {
				className: 'continue',
				msg: mw.msg( 'mobile-frontend-overlay-continue' )
			} ],
			placeHolder: mw.msg( 'mobile-frontend-errorreport-placeholder' ),
			instructions: mw.msg( 'mobile-frontend-errorreport-instructions' ),
			licenseMsg: mw.msg( 'mobile-frontend-editor-licensing', mw.config.get( 'wgMFLicenseLink' ) )
		},
		/**
		 * @inheritdoc
		 */
		templatePartials: {
			content: mw.template.get( 'mobile.errorReport.overlay', 'ErrorReportOverlay.hogan' )
		},
		/**
		 * @inheritdoc
		 */
		className: 'error-reporting-overlay overlay',
		/**
		 * @inheritdoc
		 */
		events: $.extend( {}, Overlay.prototype.events, {
			'click button.continue': 'onContinueClick',
			'click button.submit': 'onSubmitClick',
			'keyup .error-field': 'onErrorFieldChange',
			'paste .error-field': 'onErrorFieldChange',
			'drop .error-field': 'onErrorFieldChange'
		} ),

		/**
		 * Show the actual error reporting form
		 * @method
		 * @private
		 * @param {Object} options The options for the overlay
		 */
		_showForm: function ( options ) {
			options.headerButtons = [ {
				className: 'submit',
				msg: mw.msg( 'mobile-frontend-errorreport-submit' )
			} ];
			this.render( options );
			this.$( '.instructions' ).hide();
			this.$( '.error-field, .license-panel' ).show();
			this.$( 'button.submit' ).prop( 'disabled', true );
		},

		/**
		 * Post the error report to the talk page and close the overlay
		 * @method
		 * @private
		 * @param {String} text The text of the error report
		 * @param {String} title The title of the page to post the report to
		 */
		_postErrorReport: function ( text, title ) {
			var self = this;
			api.postWithToken( 'edit', {
				action: 'edit',
				section: 'new',
				sectiontitle: mw.msg( 'mobile-frontend-errorreport-section-title' ),
				title: title,
				summary: mw.msg( 'mobile-frontend-errorreport-summary' ),
				text: text + ' ~~~~'
			} ).done( function () {
				self.hide();
				toast.show( mw.msg( 'mobile-frontend-errorreport-feedback' ), 'toast' );
			} ).fail( function () {
				self.hide();
				toast.show( mw.msg( 'mobile-frontend-errorreport-error' ), 'toast' );
			} );
		},

		/**
		 * Continue button click handler
		 */
		onContinueClick: function () {
			this._showForm( this.options );
		},
		/**
		 * Submit button click handler
		 */
		onSubmitClick: function () {
			var text = this.$( '.error-field' ).val(),
				$talk = $( '.talk' );

			if ( text.length > 15 && $talk !== undefined ) {
				// Hide the textarea, show a spinner, and post the report
				this.$( '.error-field' ).hide();
				this.$( '.spinner' ).show();
				this._postErrorReport( text, $talk.data( 'title' ) );
			} else {
				// Close overlay and show error notification
				window.history.back();
				toast.show( mw.msg( 'mobile-frontend-errorreport-error' ), 'toast' );
			}
		},
		/**
		 * Error field change handler
		 * Enable the submit button when the error report is at least 15 characters
		 */
		onErrorFieldChange: function () {
			var self = this;

			// Force length check to be asynchronous in order to handle paste events
			setTimeout( function () {
				self.$( 'button.submit' ).prop( 'disabled', self.$( '.error-field' ).val().length <= 15 );
			}, 0 );
		}
	} );

	M.define( 'errorReport/ErrorReportOverlay', ErrorReportOverlay );

}( mw.mobileFrontend, jQuery ) );
