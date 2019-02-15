var util = require( './../mobile.startup/util' ),
	mfExtend = require( './../mobile.startup/mfExtend' ),
	Icon = require( './../mobile.startup/Icon' ),
	View = require( './../mobile.startup/View' );

/**
 * Shows the user a load failure message
 * @class LoadErrorMessage
 * @extends View
 * @fires LoadErrorMessage#retry
 *
 * @param {Object} options Configuration options
 */
function LoadErrorMessage( options ) {
	if ( !options.retryPath ) {
		throw new Error( '\'retryPath\' must be set in options param. Received: ' + options.retryPath );
	}
	View.call(
		this,
		{ events: { 'click .load-fail-msg-link a': 'onRetry' } },
		options
	);
}

mfExtend( LoadErrorMessage, View, {
	template: mw.template.get( 'mobile.mediaViewer', 'LoadErrorMessage.hogan' ),
	isTemplateMode: true,

	/**
		* @inheritdoc
		* @cfg {Object} defaults Default options hash.
		* @cfg {string} defaults.icon HTML of the alert icon
		* @cfg {string} defaults.msgToUser Message shown when media load fails
		* @cfg {string} defaults.retryTxt Text of retry link
		* @memberof LoadErrorMessage
		* @instance
		*/
	defaults: util.extend( {}, LoadErrorMessage.prototype.defaults, {
		icon: new Icon( {
			name: 'alert-invert',
			additionalClassNames: 'load-fail-msg-icon'
		} ).toHtmlString(),
		msgToUser: mw.msg( 'mobile-frontend-media-load-fail-message' ),
		retryTxt: mw.msg( 'mobile-frontend-media-load-fail-retry' )
	} ),

	/**
	 * @inheritdoc
	 * @memberof LoadErrorMessage
	 * @instance
	 */
	postRender: function () {
		this.$el.find( '.load-fail-msg-link a' ).attr( 'href', '#' + this.options.retryPath );
	},

	/**
	 * Event handler for retry event
	 * @param {jQuery.Event} ev
	 * @return {boolean} Returns false to prevent default behavior for links and
	 * stop the event from propagating
	 * @memberof LoadErrorMessage
	 * @instance
	 */
	onRetry: function () {
		/**
		 * Triggered when retry button is clicked.
		 * @event LoadErrorMessage#retry
		 */
		this.emit( 'retry' );

		return false;
	}
} );

module.exports = LoadErrorMessage;
