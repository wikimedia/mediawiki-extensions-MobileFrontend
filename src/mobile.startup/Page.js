var
	HTML = mw.html,
	util = require( './util' ),
	Section = require( './Section' );

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
	 * @param {Array} options.sections Array of {Section} objects.
	 * @param {string} options.url
	 * @param {string} options.wikidataDescription
	 * @param {boolean} options.isMainPage Whether the page is the Main Page.
	 * @param {boolean} options.isMissing Whether the page exists in the wiki.
	 * @param {string} options.lastModified
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
			sections: [],
			url: options.url || mw.util.getUrl( title ),
			wikidataDescription: options.wikidataDescription,
			_isMainPage: options.isMainPage || false,
			isMissing: ( options.isMissing !== undefined ) ?
				options.isMissing : options.id === 0,
			lastModified: options.lastModified,
			anchor: options.anchor,
			revId: options.revId,
			_isWatched: options.isWatched,
			thumbnail: ( Object.prototype.hasOwnProperty.call( options, 'thumbnail' ) ) ?
				options.thumbnail : false,
			_sectionLookup: {}
		} );

		( options.sections || [] ).forEach( function ( sectionData ) {
			var section = new Section( sectionData );
			this.sections.push( section );
			this._sectionLookup[section.id] = section;
		}.bind( this ) );

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
		var nsId,
			args = this.title.split( ':' );

		if ( args[1] ) {
			nsId = mw.config.get( 'wgNamespaceIds' )[ args[0].toLowerCase().replace( ' ', '_' ) ] || 0;
		} else {
			nsId = 0;
		}
		return nsId;
	}

	/**
	 * FIXME: Change function signature to take the anchor of the heading
	 *
	 * @param {string} id of the section as defined by MobileFormatter.
	 * Note, that currently, this is different from
	 * the PHP parser in that it relates to top-level sections.
	 * For example, mf-section-1 would relate to section 1. See FIXME.
	 * @return {Section}
	 */
	getSection( id ) {
		return this._sectionLookup[ id ];
	}

	/**
	 * Obtain the list of high level (and grouped) sections.
	 * Note that this list will not include subsections.
	 *
	 * @return {Array} of Section instances
	 */
	getSections() {
		return this.sections;
	}
}

module.exports = Page;
