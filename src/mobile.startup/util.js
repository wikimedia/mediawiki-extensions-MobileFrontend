/* global $ */

/**
 * Utility library
 *
 * @class util
 * @singleton
 */
module.exports = {
	/**
	 * Obtains the correct label for the save button which is project specific. It's either
	 * "save" or "publish"
	 *
	 * @return {string}
	 */
	saveButtonMessage: function () {
		return mw.config.get( 'wgEditSubmitButtonLabelPublish' ) ?
			mw.msg( 'mobile-frontend-editor-publish' ) : mw.msg( 'mobile-frontend-editor-save' );
	},
	/**
	 * Wrapper class for Promises
	 *
	 * @memberof util
	 * @instance
	 */
	Promise: {
		/**
		 * Wrapper class for the $.when that is compatible with Promise.all
		 *
		 * @memberof util
		 * @param {jQuery.Promise[]} promises
		 * @instance
		 * @return {jQuery.Promise}
		 */
		all: function ( promises ) {
			return $.when.apply( $, promises );
		}
	},
	/**
	 * Escape a string for use as a css selector
	 *
	 * @memberof util
	 * @instance
	 * @param {string} selector
	 * @return {string}
	 */
	escapeSelector: function ( selector ) {
		return $.escapeSelector( selector );
	},
	/**
	 * Wrapper class for the $.grep
	 *
	 * @memberof util
	 * @instance
	 * @return {jQuery.Deferred}
	 */
	grep: function () {
		return $.grep.apply( $, arguments );
	},
	/**
	 * Run method when document is ready.
	 *
	 * @memberof util
	 * @instance
	 * @param {Function} fn
	 * @return {jQuery.Object}
	 */
	docReady: function ( fn ) {
		return $( fn );
	},
	/**
	 * Wrapper class for the Deferred method
	 *
	 * @memberof util
	 * @instance
	 * @return {jQuery.Deferred}
	 */
	Deferred: function () {
		return $.Deferred();
	},
	/**
	 * Adds a class to the document
	 *
	 * @memberof util
	 * @instance
	 * @return {jQuery.Object} element representing the documentElement
	 */
	getDocument: function () {
		return $( document.documentElement );
	},
	/**
	 * Get the window object
	 *
	 * @memberof util
	 * @instance
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
	 * @memberof util
	 * @instance
	 * @param {string} html
	 * @param {Element} [ctx] Document element to serve as the context
	 *  in which the HTML fragment will be created
	 * @return {jQuery.Object}
	 */
	parseHTML: function ( html, ctx ) {
		ctx = ctx || document;
		return $( $.parseHTML( html, ctx ) );
	},
	/**
	 * wrapper for jQuery util function to check if something is numeric
	 *
	 * @memberof util
	 * @instance
	 * @return {boolean}
	 */
	isNumeric: function () {
		return $.isNumeric.apply( $, arguments );
	},
	/**
	 * Wrapper for jQuery.extend method. In future this can be bound to Object.assign
	 * when support allows.
	 *
	 * Warning: if only one argument is supplied to util.extend(), this means the target argument
	 * was omitted. In this case, the jQuery object itself is assumed to be the target.
	 *
	 * @memberof util
	 * @instance
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
	 * @memberof util
	 * @instance
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
	 * @memberof util
	 * @instance
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
	},

	/**
	 * Pipe event emitted by source through proxy. Subscribers to proxy will receive the event as
	 * though proxy was the originator.
	 *
	 * @param {OO.EventEmitter} src
	 * @param {OO.EventEmitter} proxy
	 * @param {string} event Event type to listen for.
	 * @param {any[]} [args] Arguments to pass to
	 *  subscribers, will be prepended to emitted arguments.
	 * @return {OO.EventEmitter} The source.
	 */
	repeatEvent: function ( src, proxy, event, args ) {
		return src.on( event, function ( args ) {
			return proxy.emit( event, args );
		}, args );
	},

	/**
	 * @typedef {Object} Template
	 * @property {Function} render returning string of rendered HTML
	 *
	 * Centralised place for template rendering.
	 *
	 * T223927: We depend on the global Mustache brought in by the
	 * mediawiki.template.mustache module but do not delegate to
	 * mediawiki.template.mustache.js because its render method returns a jQuery
	 * object, but our MobileFrontend code depends on .render returning a string.
	 *
	 * @param {string} source code of template that is Mustache compatible.
	 * @return {Template}
	 */
	template: function ( source ) {
		return {
			/**
			 * @ignore
			 * @return {string} The raw source code of the template
			 */
			getSource: function () {
				return source;
			},
			/**
			 * @ignore
			 * @param {Object} data Data to render
			 * @param {Object} partials Map partial names to Mustache template objects
			 * @return {string} Rendered HTML
			 */
			render: function ( data, partials ) {
				const partialSource = {};
				// Map MobileFrontend templates to partial strings
				Object.keys( partials || {} ).forEach( ( key ) => {
					partialSource[ key ] = partials[ key ].getSource();
				} );

				// Use global Mustache which is loaded by mediawiki.template.mustache (a
				// dependency of the mobile.startup module)
				// eslint-disable-next-line no-undef
				return Mustache.render(
					source.trim(),
					data,
					partialSource
				);
			}
		};
	}
};
