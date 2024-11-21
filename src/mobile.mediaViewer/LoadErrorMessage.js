const util = require( './../mobile.startup/util' ),
	icons = require( './../mobile.startup/icons' ),
	View = require( './../mobile.startup/View' );

/**
 * Shows the user a load failure message
 *
 * @fires LoadErrorMessage#retry
 */
class LoadErrorMessage extends View {
	/**
	 * @param {Object} options Configuration options
	 * @param {string} options.retryPath path of URL to try again
	 * @private
	 */
	constructor( options ) {
		super(
			{ events: { 'click .load-fail-msg-link a': 'onRetry' } },
			options
		);
	}

	get template() {
		return util.template( `
<div class="load-fail-msg">
  <div class="load-fail-msg-text">{{msgToUser}}</div>
  <div class="load-fail-msg-link">
    <a href="#">{{retryTxt}}</a>
  </div>
</div>
	` );
	}

	get isTemplateMode() {
		return true;
	}

	/**
		* @inheritdoc
		* @cfg {Object} defaults Default options hash.
		* @cfg {string} defaults.icon HTML of the alert icon
		* @cfg {string} defaults.msgToUser Message shown when media load fails
		* @cfg {string} defaults.retryTxt Text of retry link
		*/
	get defaults() {
		return util.extend( {}, super.defaults, {
			msgToUser: mw.msg( 'mobile-frontend-media-load-fail-message' ),
			retryTxt: mw.msg( 'mobile-frontend-media-load-fail-retry' )
		} );
	}

	/**
	 * @inheritdoc
	 */
	postRender() {
		this.$el.prepend( icons.error().$el );
		this.$el.find( '.load-fail-msg-link a' ).attr( 'href', '#' + this.options.retryPath );
	}

	/**
	 * Event handler for retry event
	 *
	 * @param {jQuery.Event} ev
	 * @return {boolean} Returns false to prevent default behavior for links and
	 * stop the event from propagating
	 */
	onRetry() {
		/**
		 * Triggered when retry button is clicked.
		 *
		 * @event LoadErrorMessage#retry
		 */
		this.emit( 'retry' );

		return false;
	}
}

module.exports = LoadErrorMessage;
