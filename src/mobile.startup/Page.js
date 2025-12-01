const
	HTML = mw.html,
	util = require( './util' );

/**
 * Mobile page view object
 */
class Page {
	/**
	 * @param {Object} options Configuration options
	 * @param {number} options.id Page ID. The default value of 0 represents a
	 * new or missing page. Be sure to override it to avoid side effects.
	 * @param {string} options.title Title of the page. It includes prefix where needed and
	 * is human readable, e.g. Talk:The man who lived.
	 * @param {Object} options.titleObj
	 * @param {string} options.displayTitle HTML title of the page for display. Falls back
	 * to defaults.title (escaped) if no value is provided. Must be safe HTML!
	 * @param {number} options.namespaceNumber the number of the
	 *  namespace the page belongs to
	 * @param {Object} options.protection List of permissions as returned by API,
	 * e.g. [{ edit: ['*'] }]
	 * @param {string} options.url
	 * @param {string} options.wikidataDescription
	 * @param {boolean} options.isMainPage Whether the page is the Main Page.
	 * @param {boolean} options.isMissing Whether the page exists in the wiki.
	 * @param {string} options.anchor
	 * @param {string} [options.relevantTitle] associated with page.
	 *  For example Special:WhatLinksHere/Foo would be associated with the page `Foo`.
	 * @param {number} options.revId  Revision ID. See `wgRevisionId`.
	 * @param {boolean} options.isWatched Whether the page is being watched
	 * @param {Object} options.thumbnail thumbnail definition corresponding to page image
	 * @param {boolean} options.thumbnail.isLandscape whether the image is in
	 *  landscape format
	 * @param {number} options.thumbnail.width of image in pixels.
	 * @param {number} options.thumbnail.height of image in pixels.
	 * @param {string} options.thumbnail.source url for image
	 */
	constructor( options ) {
		const title = options.title || '';
		util.extend( this, {
			id: options.id || 0,
			// FIXME: Deprecate title property as it can be derived from titleObj
			// using getPrefixedText
			title,
			relevantTitle: options.relevantTitle || title,
			titleObj: options.titleObj,
			displayTitle: options.displayTitle || HTML.escape( title ),
			namespaceNumber: options.namespaceNumber || 0,
			protection: options.protection,
			url: options.url || mw.util.getUrl( title ),
			wikidataDescription: options.wikidataDescription,
			_isMainPage: options.isMainPage || false,
			isMissing: ( options.isMissing !== undefined ) ?
				options.isMissing : options.id === 0,
			anchor: options.anchor,
			revId: options.revId,
			_isWatched: options.isWatched,
			thumbnail: ( Object.prototype.hasOwnProperty.call( options, 'thumbnail' ) ) ?
				options.thumbnail : false
		} );

		if ( this.thumbnail && this.thumbnail.width ) {
			this.thumbnail.isLandscape = this.thumbnail.width > this.thumbnail.height;
		}
	}

	/**
	 * Retrieve the title that should be displayed to the user
	 *
	 * @return {string} HTML
	 */
	getDisplayTitle() {
		return this.displayTitle;
	}

	/**
	 * Determine if current page is in a specified namespace
	 *
	 * @param {string} namespace Name of namespace
	 * @return {boolean}
	 */
	inNamespace( namespace ) {
		return this.namespaceNumber === mw.config.get( 'wgNamespaceIds' )[namespace];
	}

	/**
	 * Determines if content model is wikitext
	 *
	 * @return {boolean}
	 */
	isWikiText() {
		return mw.config.get( 'wgPageContentModel' ) === 'wikitext';
	}

	/**
	 * Check if the visual editor is available on this page
	 *
	 * @return {boolean}
	 */
	isVEAvailable() {
		return !!mw.config.get( 'wgVisualEditorConfig' ) &&
			!mw.config.get( 'wgVisualEditorDisabledByHook' ) &&
			this.isWikiText();
	}

	/**
	 * Check if the visual editor in visual mode is available on this page
	 *
	 * @return {boolean}
	 */
	isVEVisualAvailable() {
		if ( !this.isVEAvailable() ) {
			return false;
		}
		const config = mw.config.get( 'wgVisualEditorConfig' );
		const visualEditorNamespaces = config.namespaces || [];

		return visualEditorNamespaces.includes( mw.config.get( 'wgNamespaceNumber' ) );
	}

	/**
	 * Check if the visual editor in source mode is available on this page
	 *
	 * @return {boolean}
	 */
	isVESourceAvailable() {
		return this.isVEAvailable() &&
			mw.config.get( 'wgMFEnableVEWikitextEditor' );
	}

	/**
	 * Checks whether the current page is the main page
	 *
	 * @return {boolean}
	 */
	isMainPage() {
		return this._isMainPage;
	}

	/**
	 * Checks whether the current page is watched
	 *
	 * @return {boolean}
	 */
	isWatched() {
		return this._isWatched;
	}

	/**
	 * Return the latest revision id for this page
	 *
	 * @return {number}
	 */
	getRevisionId() {
		return this.revId;
	}

	/**
	 * Return prefixed page title
	 *
	 * @return {string}
	 */
	getTitle() {
		return this.title;
	}

	/**
	 * return namespace id
	 *
	 * @return {number} namespace Number
	 */
	getNamespaceId() {
		let nsId;
		const args = this.title.split( ':' );

		if ( args[1] ) {
			nsId = mw.config.get( 'wgNamespaceIds' )[ args[0].toLowerCase().replace( ' ', '_' ) ] || 0;
		} else {
			nsId = 0;
		}
		return nsId;
	}
}

module.exports = Page;
