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
