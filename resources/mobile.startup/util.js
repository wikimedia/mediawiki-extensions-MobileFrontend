( function ( M, $ ) {
	var util;

	/**
	 * Utility library
	 * @class util
	 * @singleton
	 */
	util = {
		/**
		 * wrapper for jQuery util noop function
		 *
		 * @method
		 * @return {Function}
		 */
		noop: $.noop,
		/**
		 * wrapper for jQuery util function to check if something is a function
		 *
		 * @method
		 * @return {Boolean}
		 */
		isFunction: function () {
			return $.isFunction.apply( $, arguments );
		},
		/**
		 * wrapper for jQuery util function to check if something is numeric
		 *
		 * @method
		 * @return {Boolean}
		 */
		isNumeric: function () {
			return $.isNumeric.apply( $, arguments );
		},
		/**
		 * Wrapper for jQuery.extend method. In future this can be bound to Object.assign
		 * when support allows.
		 *
		 * @method
		 * @return {Object}
		 */
		extend: function () {
			return $.extend.apply( $, arguments );
		},
		/**
		 * Escape dots and colons in a hash, jQuery doesn't like them because they
		 * look like CSS classes and pseudoclasses. See
		 * http://bugs.jquery.com/ticket/5241
		 * http://stackoverflow.com/questions/350292/how-do-i-get-jquery-to-select-elements-with-a-period-in-their-id
		 *
		 * @method
		 * @param {string} hash A hash to escape
		 * @return {string}
		 */
		escapeHash: function ( hash ) {
			return hash.replace( /(:|\.)/g, '\\$1' );
		},

		/**
		 * Heuristic for determining whether an Event should be handled by
		 * MobileFrontend or allowed to bubble to the browser.
		 *
		 * @param {Event} ev
		 * @return {boolean} True if event is modified with control, alt, meta, or
		 *                   shift keys and should probably be handled by the
		 *                   browser.
		 *
		 * todo: move this function to a ClickUtil file once bundling and code
		 * splitting is supported.
		 */
		isModifiedEvent: function ( ev ) {
			return ev.altKey || ev.ctrlKey || ev.metaKey || ev.shiftKey;
		}
	};

	M.define( 'mobile.startup/util', util );

}( mw.mobileFrontend, jQuery ) );
