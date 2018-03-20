/* global jQuery */
( function ( M, $ ) {
	var util,
		log = mw.log; // resource-modules-disable-line

	/**
	 * Utility library
	 * @class util
	 * @singleton
	 */
	util = {
		/**
		 * Escape a string for use as a css selector
		 *
		 * @method
		 * @param {string} selector
		 * @return {string}
		 */
		escapeSelector: function ( selector ) {
			return $.escapeSelector( selector );
		},
		/**
		 * Wrapper class for the $.grep
		 *
		 * @method
		 * @return {jQuery.Deferred}
		 */
		grep: function () {
			return $.grep.apply( $, arguments );
		},
		/**
		 * Run method when document is ready.
		 *
		 * @method
		 * @param {Function} fn
		 * @return {jQuery.Object}
		 */
		docReady: function ( fn ) {
			return $( fn );
		},
		/**
		 * Wrapper class for the $.when
		 *
		 * @method
		 * @return {jQuery.Deferred}
		 */
		when: function () {
			return $.when.apply( $, arguments );
		},
		/**
		 * Wrapper class for the Deferred method
		 *
		 * @method
		 * @return {jQuery.Deferred}
		 */
		Deferred: function () {
			var d = $.Deferred(),
				warning = 'Use Promise compatible methods `then` and `catch` instead.';

			log.deprecate( d, 'fail', d.fail, warning );
			log.deprecate( d, 'always', d.always, warning );
			log.deprecate( d, 'done', d.done, warning );
			return d;
		},
		/**
		 * Adds a class to the document
		 *
		 * @method
		 * @return {jQuery.Object} element representing the documentElement
		 */
		getDocument: function () {
			return $( document.documentElement );
		},
		/**
		 * Get the window object
		 *
		 * @method
		 * @return {jQuery.Object}
		 */
		getWindow: function () {
			return $( window );
		},
		/**
		 * Given some html, create new element(s).
		 * Unlike jQuery.parseHTML this will return a jQuery object
		 * not an array.
		 *
		 * @param {string} html
		 * @param {Element} [ctx] Document element to serve as the context in which the HTML fragment will be created
		 * @return {jQuery.Object}
		 */
		parseHTML: function ( html, ctx ) {
			return $( $.parseHTML( html, ctx ) );
		},
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
