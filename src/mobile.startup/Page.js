var
	HTML = mw.html,
	mfExtend = require( './mfExtend' ),
	util = require( './util' ),
	Section = require( './Section' ),
	Thumbnail = require( './Thumbnail' ),
	HEADING_SELECTOR = mw.config.get( 'wgMFMobileFormatterHeadings', [ 'h1', 'h2', 'h3', 'h4', 'h5' ] ).join( ',' ),
	BLACKLISTED_THUMBNAIL_CLASS_SELECTORS = [ 'noviewer', 'metadata' ];

/**
 * Mobile page view object
 *
 * @class Page
 *
 * @param {Object} options Configuration options
 * @param {jQuery.Object} options.el Used for html parsing
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
 * @param {number} options.revId  Revision ID. See `wgRevisionId`.
 * @param {boolean} options.isWatched Whether the page is being watched
 * @param {Object} options.thumbnail thumbnail definition corresponding to page image
 * @param {boolean} options.thumbnail.isLandscape whether the image is in
 *  landscape format
 * @param {number} options.thumbnail.width of image in pixels.
 * @param {number} options.thumbnail.height of image in pixels.
 * @param {string} options.thumbnail.source url for image
 */
function Page( options ) {
	util.extend( this, {
		// eslint-disable-next-line no-undef
		$el: options.el ? $( options.el ) : util.parseHTML( '<div>' ),
		id: options.id || 0,
		// FIXME: Deprecate title property as it can be derived from titleObj using getPrefixedText
		title: options.title || '',
		titleObj: options.titleObj,
		displayTitle: options.displayTitle || HTML.escape( options.title || '' ),
		namespaceNumber: options.namespaceNumber || 0,
		protection: options.protection,
		sections: [],
		url: options.url || mw.util.getUrl( options.title ),
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

	// memoize headings as $el.find is a very expensive call
	this.$headings = this.$el.find( HEADING_SELECTOR );
}

mfExtend( Page, {
	/**
	 * Retrieve the title that should be displayed to the user
	 * @memberof Page
	 * @instance
	 * @return {string} HTML
	 */
	getDisplayTitle: function () {
		return this.displayTitle;
	},
	/**
	 * Determine if current page is in a specified namespace
	 * @memberof Page
	 * @instance
	 * @param {string} namespace Name of namespace
	 * @return {boolean}
	 */
	inNamespace: function ( namespace ) {
		return this.namespaceNumber === mw.config.get( 'wgNamespaceIds' )[namespace];
	},

	/**
	 * Find the heading in the page.
	 * This has the benefit of excluding any additional h2s and h3s that may
	 * have been added programatically.
	 * @method
	 * @param {number} sectionIndex as defined by the PHP parser.
	 *  It should correspond to the section id
	 *  used in the edit link for the section.
	 *  Note, confusingly, this is different from section "ID" which is
	 * used in methods
	 * @return {jQuery.Object}
	 */
	findSectionHeadingByIndex: function ( sectionIndex ) {
		if ( sectionIndex < 1 ) {
			// negative indexes will search from the end, which is behaviour we do not want.
			// return an empty set when this happens.
			return this.$el.find();
		} else {
			return this.$headings
				// Headings must strictly be a child element of a section element
				// or the parser-output.
				// Not an ancestor!
				.filter( '.mw-parser-output > *, [class^="mf-section-"] > *' ).eq( sectionIndex - 1 );
		}
	},
	/**
	 * Finds all child elements that match the selector in a given section or subsection.
	 * Returns any direct child elements that match the selector,
	 * (i.e. searches only one level deep)
	 * as well as any elements that match the selector within those children.
	 * If the Page has no headings (e.g. a stub),
	 * then the search will target all nodes within the page.
	 *
	 * This code should work on desktop (PHP parser HTML)
	 * as well as mobile formatted HTML (PHP parser + MobileFormatter)
	 * @method
	 * @param {number} sectionIndex as defined by the PHP parser. It should correspond to
	 *  the section id used in the edit link for the section.
	 *  Note, confusingly, this is different from section "ID" which is
	 *  used in methods
	 * @param {string} selector to match
	 * @return {jQuery.Object}
	 */
	findChildInSectionLead: function ( sectionIndex, selector ) {
		var $heading, $nextHeading, $container, $lead,
			headingSelector = HEADING_SELECTOR;

		function withNestedChildren( $matchingNodes ) {
			return $matchingNodes.find( selector ).addBack();
		}

		if ( sectionIndex === 0 ) {
			// lead is easy
			$lead = this.getLeadSectionElement();
			if ( $lead && $lead.length ) {
				return withNestedChildren( $lead.children( selector ) );
			} else {
				$heading = this.findSectionHeadingByIndex( 1 );
				return $heading.length ? withNestedChildren( $heading.prevAll( selector ) ) :
					// this page is a stub so search entire page
					this.$el.find( selector );
			}
		}

		// find heading associated with the section by looking at its
		// index position in the article
		// section ids relate to the element position in the page and the first heading
		// lead has been dealt with above, so first heading corresponds to section 1,
		// the first heading in the article.
		$heading = this.findSectionHeadingByIndex( sectionIndex );

		// If section-heading is present on the heading,
		// then we know the page has been MobileFormatted
		// and that this is a wrapped section
		if ( $heading.hasClass( 'section-heading' ) ) {
			// get content of section
			$container = $heading.next();
			// inside section find the first heading
			$nextHeading = $container.find( headingSelector ).eq( 0 );
			return $nextHeading.length ?
				// find all amboxes before the next heading
				withNestedChildren( $nextHeading.prevAll( selector ) ) :
				// There is no subheadings inside
				// Grab all issues in section
				withNestedChildren( $container.children( selector ) );
		} else {
			// the heading relates to a subsection (or unwrapped desktop section),
			// so grab elements between this and the next one
			$nextHeading = $heading.eq( 0 ).nextAll( headingSelector ).eq( 0 );
			return $heading.nextUntil( $nextHeading, selector );
		}
	},

	/**
	 * Get the lead section of the page view.
	 * @memberof Page
	 * @instance
	 * @return {jQuery.Object|null}
	 */
	getLeadSectionElement: function () {
		/*
		 * The page is formatted as follows:
		 * <div id="bodyContent">
		 *   <!-- content of the page.. -->
		 *   <div id="mw-content-text">
		 *     <div class="mf-section-0">lead section</div>
		 *     <h2></h2>
		 *     <div class="mf-section-1">second section</div>
		 *   </div>
		 * </div>
		 */
		if ( this.$el.find( '.mf-section-0' ).length ) {
			return this.$el.find( '.mf-section-0' );
		}
		// no lead section found
		return null;
	},

	/**
	 * Determines if content model is wikitext
	 * @memberof Page
	 * @instance
	 * @return {boolean}
	 */
	isWikiText: function () {
		return mw.config.get( 'wgPageContentModel' ) === 'wikitext';
	},

	/**
	 * Checks whether the current page is the main page
	 * @memberof Page
	 * @instance
	 * @return {boolean}
	 */
	isMainPage: function () {
		return this._isMainPage;
	},
	/**
	 * Checks whether the current page is watched
	 * @memberof Page
	 * @instance
	 * @return {boolean}
	 */
	isWatched: function () {
		return this._isWatched;
	},

	/**
	 * Return the latest revision id for this page
	 * @memberof Page
	 * @instance
	 * @return {number}
	 */
	getRevisionId: function () {
		return this.revId;
	},

	/**
	 * Return prefixed page title
	 * @memberof Page
	 * @instance
	 * @return {string}
	 */
	getTitle: function () {
		return this.title;
	},

	/**
	 * return namespace id
	 * @memberof Page
	 * @instance
	 * @return {number} namespace Number
	 */
	getNamespaceId: function () {
		var nsId,
			args = this.title.split( ':' );

		if ( args[1] ) {
			nsId = mw.config.get( 'wgNamespaceIds' )[ args[0].toLowerCase().replace( ' ', '_' ) ] || 0;
		} else {
			nsId = 0;
		}
		return nsId;
	},

	/**
	 * Return all the thumbnails in the article.
	 * Images which have a class or link container (.image|.thumbimage)
	 * that matches one of the items of the constant BLACKLISTED_THUMBNAIL_CLASS_SELECTORS
	 * will be excluded.
	 * A thumbnail nested inside one of these classes will still be returned.
	 * e.g. `<div class="noviewer"><a class="image"><img></a></div>` is not a valid thumbnail
	 * `<a class="image noviewer"><img></a>` is not a valid thumbnail
	 * `<a class="image"><img class="noviewer"></a>` is not a valid thumbnail
	 * @memberof Page
	 * @instance
	 * @param {jQuery} [$container] Container to search, defaults to this.$el.
	 * @return {Thumbnail[]}
	 */
	getThumbnails: function ( $container ) {
		var $thumbs,
			blacklistSelector = '.' + BLACKLISTED_THUMBNAIL_CLASS_SELECTORS.join( ',.' ),
			thumbs = [];

		$container = $container || this.$el;

		$thumbs = $container.find( 'a.image, a.thumbimage' )
			.not( blacklistSelector );

		$thumbs.each( function () {
			var $a = $container.find( this ),
				$lazyImage = $a.find( '.lazy-image-placeholder' ),
				// Parents need to be checked as well.
				valid = $a.parents( blacklistSelector ).length === 0 &&
					$a.find( blacklistSelector ).length === 0,
				legacyMatch = $a.attr( 'href' ).match( /title=([^/&]+)/ ),
				match = $a.attr( 'href' ).match( /[^/]+$/ );

			// filter out invalid lazy loaded images if so far image is valid
			if ( $lazyImage.length && valid ) {
				// if the regex matches it means the image has one of the classes
				// thus we must invert the result
				valid = !new RegExp( '\\b(' + BLACKLISTED_THUMBNAIL_CLASS_SELECTORS.join( '|' ) + ')\\b' )
					.test( $lazyImage.data( 'class' ) );
			}

			if ( valid && ( legacyMatch || match ) ) {
				thumbs.push(
					new Thumbnail( {
						el: $a,
						filename: decodeURIComponent(
							legacyMatch ? legacyMatch[1] : match[0]
						)
					} )
				);
			}
		} );
		return thumbs;
	},

	/**
	 * FIXME: Change function signature to take the anchor of the heading
	 * @memberof Page
	 * @instance
	 * @param {string} id of the section as defined by MobileFormatter.
	 * Note, that currently, this is different from
	 * the PHP parser in that it relates to top-level sections.
	 * For example, mf-section-1 would relate to section 1. See FIXME.
	 * @return {Section}
	 */
	getSection: function ( id ) {
		return this._sectionLookup[ id ];
	},

	/**
	 * Obtain the list of high level (and grouped) sections.
	 * Note that this list will not include subsections.
	 * @memberof Page
	 * @instance
	 * @return {Array} of Section instances
	 */
	getSections: function () {
		return this.sections;
	},

	/**
	 * Returns a jQuery object representing all redlinks on the page.
	 * @memberof Page
	 * @instance
	 * @return {jQuery.Object}
	 */
	getRedLinks: function () {
		return this.$el.find( '.new' );
	}
} );

/**
 * Selector for matching headings
 *
 * @memberof Page
 */
Page.HEADING_SELECTOR = HEADING_SELECTOR;

module.exports = Page;
