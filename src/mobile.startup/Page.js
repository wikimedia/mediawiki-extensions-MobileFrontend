var
	HTML = mw.html,
	mfExtend = require( './mfExtend' ),
	time = require( './time' ),
	util = require( './util' ),
	Section = require( './Section' ),
	Thumbnail = require( './Thumbnail' ),
	View = require( './View' ),
	HEADING_SELECTOR = mw.config.get( 'wgMFMobileFormatterHeadings', [ 'h1', 'h2', 'h3', 'h4', 'h5' ] ).join( ',' ),
	BLACKLISTED_THUMBNAIL_CLASS_SELECTORS = [ 'noviewer', 'metadata' ];

/**
 * Mobile page view object
 *
 * @class Page
 * @uses Section
 * @extends View
 *
 * @param {Object} options Configuration options
 */
function Page( options ) {

	util.extend( this, {
		options: options,
		// FIXME: Deprecate title property as it can be derived from titleObj using getPrefixedText
		title: options.title,
		titleObj: options.titleObj,
		displayTitle: options.displayTitle,
		url: options.url || mw.util.getUrl( options.title ),
		id: options.id,
		wikidataDescription: options.wikidataDescription,
		thumbnail: ( Object.prototype.hasOwnProperty.call( options, 'thumbnail' ) ) ?
			options.thumbnail : false,
		isMissing: ( options.isMissing !== undefined ) ?
			options.isMissing : options.id === 0
	} );

	this.options.isBorderBox = false;
	this.options.languageUrl = mw.util.getUrl( 'Special:MobileLanguages/' + this.title );

	View.call( this, this.options );

	// Fallback if no displayTitle provided
	if ( !this.displayTitle ) {
		this.displayTitle = this.getDisplayTitle();
	}

	if ( this.thumbnail && this.thumbnail.width ) {
		this.thumbnail.isLandscape = this.thumbnail.width > this.thumbnail.height;
	}
}

mfExtend( Page, View, {
	/**
	 * @memberof Page
	 * @instance
	 * @mixes View#defaults
	 * @property {Object} defaults Default options hash.
	 * @property {number} defaults.id Page ID. The default value of 0 represents a
	 * new or missing page. Be sure to override it to avoid side effects.
	 * @property {string} defaults.title Title of the page. It includes prefix where needed and
	 * is human readable, e.g. Talk:The man who lived.
	 * @property {string} defaults.displayTitle HTML title of the page for display. Falls back
	 * to defaults.title (escaped) if no value is provided. Must be safe HTML!
	 * @property {number} defaults.namespaceNumber the number of the
	 *  namespace the page belongs to
	 * @property {Object} defaults.protection List of permissions as returned by API,
	 * e.g. [{ edit: ['*'] }]
	 * @property {Array} defaults.sections Array of {Section} objects.
	 * @property {boolean} defaults.isMainPage Whether the page is the Main Page.
	 * @property {boolean} defaults.isMissing Whether the page exists in the wiki.
	 * @property {Object} defaults.thumbnail thumbnail definition corresponding to page image
	 * @property {boolean} defaults.thumbnail.isLandscape whether the image is in
	 *  landscape format
	 * @property {number} defaults.thumbnail.width of image in pixels.
	 * @property {number} defaults.thumbnail.height of image in pixels.
	 * @property {string} defaults.thumbnail.source url for image
	 */
	defaults: {
		id: 0,
		title: '',
		displayTitle: '',
		namespaceNumber: 0,
		protection: {
			edit: [ '*' ]
		},
		sections: [],
		isMissing: false,
		isMainPage: false,
		url: undefined,
		thumbnail: {
			isLandscape: undefined,
			source: undefined,
			width: undefined,
			height: undefined
		}
	},
	/**
	 * Retrieve the title that should be displayed to the user
	 * @memberof Page
	 * @instance
	 * @return {string} HTML
	 */
	getDisplayTitle: function () {
		return this.options.displayTitle || HTML.escape( this.options.title );
	},
	/**
	 * Determine if current page is in a specified namespace
	 * @memberof Page
	 * @instance
	 * @param {string} namespace Name of namespace
	 * @return {boolean}
	 */
	inNamespace: function ( namespace ) {
		return this.options.namespaceNumber === mw.config.get( 'wgNamespaceIds' )[namespace];
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
			return this.$el.find( HEADING_SELECTOR )
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
		return this.options.isMainPage;
	},
	/**
	 * Checks whether the current page is watched
	 * @memberof Page
	 * @instance
	 * @return {boolean}
	 */
	isWatched: function () {
		return this.options.isWatched;
	},

	/**
	 * Return the latest revision id for this page
	 * @memberof Page
	 * @instance
	 * @return {number}
	 */
	getRevisionId: function () {
		return this.options.revId;
	},

	/**
	 * Return prefixed page title
	 * @memberof Page
	 * @instance
	 * @return {string}
	 */
	getTitle: function () {
		return this.options.title;
	},

	/**
	 * Return page id
	 * @memberof Page
	 * @instance
	 * @return {number}
	 */
	getId: function () {
		return this.options.id;
	},

	/**
	 * return namespace id
	 * @memberof Page
	 * @instance
	 * @return {number} namespace Number
	 */
	getNamespaceId: function () {
		var nsId,
			args = this.options.title.split( ':' );

		if ( args[1] ) {
			nsId = mw.config.get( 'wgNamespaceIds' )[ args[0].toLowerCase().replace( ' ', '_' ) ] || 0;
		} else {
			nsId = 0;
		}
		return nsId;
	},

	/**
	 * Determines if current page is a talk page
	 * @memberof Page
	 * @instance
	 * @return {boolean} Whether the page is a talk page or not
	 */
	isTalkPage: function () {
		var ns = this.getNamespaceId();
		// all talk pages are odd Numbers (except the case of special pages)
		return ns > 0 && ns % 2 === 1;
	},

	/**
	 * @inheritdoc
	 * @memberof Page
	 * @instance
	 */
	preRender: function () {
		this.sections = [];
		this._sectionLookup = {};
		this.title = this.options.title;

		this.options.sections.forEach( function ( sectionData ) {
			var section = new Section( sectionData );
			this.sections.push( section );
			this._sectionLookup[section.id] = section;
		}.bind( this ) );
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
	 * @return {Thumbnail[]}
	 */
	getThumbnails: function () {
		var $thumbs,
			$el = this.$el,
			blacklistSelector = '.' + BLACKLISTED_THUMBNAIL_CLASS_SELECTORS.join( ',.' ),
			thumbs = [];

		if ( !this._thumbs ) {
			$thumbs = $el.find( 'a.image, a.thumbimage' )
				.not( blacklistSelector );

			$thumbs.each( function () {
				var $a = $el.find( this ),
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
			this._thumbs = thumbs;
		}
		return this._thumbs;
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
 * Create a Page object from an API response.
 *
 * @memberof Page
 * @param {Object} resp as representing a page in the API
 * @return {Page}
 */
Page.newFromJSON = function ( resp ) {
	var revision, displayTitle,
		thumb = resp.thumbnail,
		pageprops = resp.pageprops || {
			displaytitle: HTML.escape( resp.title )
		},
		terms = resp.terms;

	if ( pageprops || terms ) {
		// The label is either the display title or the label pageprop
		// (the latter used by Wikidata)
		// Long term we want to consolidate these.
		// Note that pageprops.displaytitle is HTML, while
		// terms.label[0] is plain text.
		displayTitle = terms && terms.label ?
			HTML.escape( terms.label[0] ) : pageprops.displaytitle;
	}
	// Add Wikidata descriptions if available (T101719)
	resp.wikidataDescription = resp.description || undefined;

	if ( thumb ) {
		resp.thumbnail.isLandscape = thumb.width > thumb.height;
	}

	// page may or may not exist.
	if ( resp.revisions && resp.revisions[0] ) {
		revision = resp.revisions[0];
		resp.lastModified = time.getLastModifiedMessage(
			new Date( revision.timestamp ).getTime() / 1000,
			revision.user
		);
	}

	return new Page(
		util.extend( resp, {
			id: resp.pageid,
			isMissing: !!resp.missing,
			url: mw.util.getUrl( resp.title ),
			displayTitle: displayTitle // this is HTML!
		} )
	);
};

/**
 * Selector for matching headings
 *
 * @memberof Page
 */
Page.HEADING_SELECTOR = HEADING_SELECTOR;

module.exports = Page;
