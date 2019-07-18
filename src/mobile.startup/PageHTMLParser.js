const
	Thumbnail = require( './Thumbnail' ),
	HEADING_SELECTOR = mw.config.get( 'wgMFMobileFormatterHeadings', [ 'h1', 'h2', 'h3', 'h4', 'h5' ] ).join( ',' ),
	BLACKLISTED_THUMBNAIL_CLASS_SELECTORS = [ 'noviewer', 'metadata' ];

class PageHTMLParser {
	/**
	 * @param {jQuery.Object} $container Used when parsing to find children within
	 * this container
	 */
	constructor( $container ) {
		this.$el = $container;

		// T220751: Cache headings as $el.find is a very expensive call.
		/** @private */
		this.$headings = this.$el.find( HEADING_SELECTOR );
	}

	/**
	 * Find the heading in the page.
	 * This has the benefit of excluding any additional h2s and h3s that may
	 * have been added programatically.
	 * @param {number} sectionIndex as defined by the PHP parser.
	 *  It should correspond to the section id
	 *  used in the edit link for the section.
	 *  Note, confusingly, this is different from section "ID" which is
	 * used in methods
	 * @return {jQuery.Object}
	 */
	findSectionHeadingByIndex( sectionIndex ) {
		if ( sectionIndex < 1 ) {
			// negative indexes will search from the end, which is behaviour we do not want.
			// return an empty set when this happens.
			// eslint-disable-next-line no-undef
			return $( [] );
		} else {
			return this.$headings
				// Headings must strictly be a child element of a section element
				// or the parser-output.
				// Not an ancestor!
				.filter( '.mw-parser-output > *, [class^="mf-section-"] > *' ).eq( sectionIndex - 1 );
		}
	}

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
	 * @param {number} sectionIndex as defined by the PHP parser. It should correspond to
	 *  the section id used in the edit link for the section.
	 *  Note, confusingly, this is different from section "ID" which is
	 *  used in methods
	 * @param {string} selector to match
	 * @return {jQuery.Object}
	 */
	findChildInSectionLead( sectionIndex, selector ) {
		var $heading, $nextHeading, $el, $lead,
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
			$el = $heading.next();
			// inside section find the first heading
			$nextHeading = $el.find( headingSelector ).eq( 0 );
			return $nextHeading.length ?
				// find all amboxes before the next heading
				withNestedChildren( $nextHeading.prevAll( selector ) ) :
				// There is no subheadings inside
				// Grab all issues in section
				withNestedChildren( $el.children( selector ) );
		} else {
			// the heading relates to a subsection (or unwrapped desktop section),
			// so grab elements between this and the next one
			$nextHeading = $heading.eq( 0 ).nextAll( headingSelector ).eq( 0 );
			return $heading.nextUntil( $nextHeading, selector );
		}
	}

	/**
	 * Get the lead section of the page view.
	 * @return {jQuery.Object|null}
	 */
	getLeadSectionElement() {
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
		const leadSection = this.$el.find( '.mf-section-0' );

		if ( leadSection.length ) {
			return leadSection;
		}
		// no lead section found
		return null;
	}

	/**
	 * Return all the thumbnails in the article.
	 * Images which have a class or link container (.image|.thumbimage)
	 * that matches one of the items of the constant BLACKLISTED_THUMBNAIL_CLASS_SELECTORS
	 * will be excluded.
	 * A thumbnail nested inside one of these classes will still be returned.
	 * e.g. `<div class="noviewer"><a class="image"><img></a></div>` is not a valid thumbnail
	 * `<a class="image noviewer"><img></a>` is not a valid thumbnail
	 * `<a class="image"><img class="noviewer"></a>` is not a valid thumbnail
	 * @param {jQuery} [$el] Container to search, defaults to this.$el.
	 * @return {Thumbnail[]}
	 */
	getThumbnails( $el ) {
		var $thumbs,
			blacklistSelector = '.' + BLACKLISTED_THUMBNAIL_CLASS_SELECTORS.join( ',.' ),
			thumbs = [];

		$el = $el || this.$el;

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
		return thumbs;
	}

	/**
	 * Returns a jQuery object representing all redlinks on the page.
	 * @return {jQuery.Object}
	 */
	getRedLinks() {
		return this.$el.find( '.new' );
	}
}

/**
 * Selector for matching headings
 *
 * @memberof PageHTMLParser
 */
PageHTMLParser.HEADING_SELECTOR = HEADING_SELECTOR;

module.exports = PageHTMLParser;
