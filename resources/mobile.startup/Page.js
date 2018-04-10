( function ( HTML, M ) {

	var time = M.require( 'mobile.startup/time' ),
		util = M.require( 'mobile.startup/util' ),
		View = M.require( 'mobile.startup/View' ),
		Section = M.require( 'mobile.startup/Section' ),
		Thumbnail = M.require( 'mobile.startup/Thumbnail' ),
		BLACKLISTED_THUMBNAIL_CLASS_SELECTORS = [ 'noviewer', 'metadata' ];

	/**
	 * Mobile page view object
	 *
	 * @class Page
	 * @uses Section
	 * @extends View
	 *
	 * @constructor
	 * @param {Object} options Configuration options
	 */
	function Page( options ) {
		var thumb;
		// thumbnail if not passed should be made false (truthy) so that it renders placeholder when absent
		if ( options.thumbnail === undefined ) {
			options.thumbnail = false;
		}
		this.options = options;
		options.languageUrl = mw.util.getUrl( 'Special:MobileLanguages/' + options.title );
		View.call( this, options );
		// Fallback if no displayTitle provided
		options.displayTitle = this.getDisplayTitle();
		// allow usage in templates.
		// FIXME: Should View map all options to properties?
		this.title = options.title;
		this.displayTitle = options.displayTitle;
		this.thumbnail = options.thumbnail;
		this.url = options.url || mw.util.getUrl( options.title );
		this.id = options.id;
		this.isMissing = options.isMissing !== undefined ? options.isMissing : options.id === 0;
		thumb = this.thumbnail;
		if ( thumb && thumb.width ) {
			this.thumbnail.isLandscape = thumb.width > thumb.height;
		}
		this.wikidataDescription = options.wikidataDescription;
	}

	OO.mfExtend( Page, View, {
		/**
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {number} defaults.id Page ID. The default value of 0 represents a new page.
		 * Be sure to override it to avoid side effects.
		 * @cfg {string} defaults.title Title of the page. It includes prefix where needed and
		 * is human readable, e.g. Talk:The man who lived.
		 * @cfg {string} defaults.displayTitle HTML title of the page for display. Falls back
		 * to defaults.title (escaped) if no value is provided. Must be safe HTML!
		 * @cfg {number} defaults.namespaceNumber the number of the namespace the page belongs to
		 * @cfg {Object} defaults.protection List of permissions as returned by API,
		 * e.g. [{ edit: ['*'] }]
		 * @cfg {Array} defaults.sections Array of {Section} objects.
		 * @cfg {boolean} defaults.isMainPage Whether the page is the Main Page.
		 * @cfg {boolean} defaults.isMissing Whether the page exists in the wiki.
		 * @cfg {Object} defaults.thumbnail thumbnail definition corresponding to page image
		 * @cfg {boolean} defaults.thumbnail.isLandscape whether the image is in landscape format
		 * @cfg {number} defaults.thumbnail.width of image in pixels.
		 * @cfg {number} defaults.thumbnail.height of image in pixels.
		 * @cfg {string} defaults.thumbnail.source url for image
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
		 * @inheritdoc
		 */
		isBorderBox: false,
		/**
		 * Retrieve the title that should be displayed to the user
		 * @method
		 * @return {string} HTML
		 */
		getDisplayTitle: function () {
			return this.options.displayTitle || HTML.escape( this.options.title );
		},
		/**
		 * Determine if current page is in a specified namespace
		 * @method
		 * @param {string} namespace Name of namespace
		 * @return {boolean}
		 */
		inNamespace: function ( namespace ) {
			return this.options.namespaceNumber === mw.config.get( 'wgNamespaceIds' )[namespace];
		},

		/**
		 * Get the lead section of the page view.
		 * @method
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
			if ( this.$( '.mf-section-0' ).length ) {
				return this.$( '.mf-section-0' );
			}
			// no lead section found
			return null;
		},

		/**
		 * Determines if content model is wikitext
		 * @method
		 * @return {boolean}
		 */
		isWikiText: function () {
			return mw.config.get( 'wgPageContentModel' ) === 'wikitext';
		},

		/**
		 * Checks whether the current page is the main page
		 * @method
		 * @return {boolean}
		 */
		isMainPage: function () {
			return this.options.isMainPage;
		},
		/**
		 * Checks whether the current page is watched
		 * @method
		 * @return {boolean}
		 */
		isWatched: function () {
			return this.options.isWatched;
		},

		/**
		 * Return the latest revision id for this page
		 * @method
		 * @return {number}
		 */
		getRevisionId: function () {
			return this.options.revId;
		},

		/**
		 * Return prefixed page title
		 * @method
		 * @return {string}
		 */
		getTitle: function () {
			return this.options.title;
		},

		/**
		 * Return page id
		 * @method
		 * @return {number}
		 */
		getId: function () {
			return this.options.id;
		},

		/**
		 * return namespace id
		 * @method
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
		 * @method
		 * @return {boolean} Whether the page is a talk page or not
		 */
		isTalkPage: function () {
			var ns = this.getNamespaceId();
			// all talk pages are odd Numbers (except the case of special pages)
			return ns > 0 && ns % 2 === 1;
		},

		/**
		 * @inheritdoc
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
		 * Return all the thumbnails in the article. Images which have a class or link container (.image|.thumbimage)
		 * that matches one of the items of the constant BLACKLISTED_THUMBNAIL_CLASS_SELECTORS will be excluded.
		 * A thumbnail nested inside one of these classes will still be returned.
		 * e.g. `<div class="noviewer"><a class="image"><img></a></div>` is not a valid thumbnail
		 * `<a class="image noviewer"><img></a>` is not a valid thumbnail
		 * `<a class="image"><img class="noviewer"></a>` is not a valid thumbnail
		 * @method
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
						valid = $a.parents( blacklistSelector ).length === 0 && $a.find( blacklistSelector ).length === 0,
						legacyMatch = $a.attr( 'href' ).match( /title=([^/&]+)/ ),
						match = $a.attr( 'href' ).match( /[^/]+$/ );

					// filter out invalid lazy loaded images if so far image is valid
					if ( $lazyImage.length && valid ) {
						// if the regex matches it means the image has one of the classes - so we must invert the result
						valid = !new RegExp( '\\b(' + BLACKLISTED_THUMBNAIL_CLASS_SELECTORS.join( '|' ) + ')\\b' )
							.test( $lazyImage.data( 'class' ) );
					}

					if ( valid && ( legacyMatch || match ) ) {
						thumbs.push(
							new Thumbnail( {
								el: $a,
								filename: decodeURIComponent( legacyMatch ? legacyMatch[1] : match[0] )
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
		 * @method
		 * @param {string} id of the section
		 * @return {Section}
		 */
		getSection: function ( id ) {
			return this._sectionLookup[ id ];
		},

		/**
		 * @method
		 * @return {Array}
		 */
		getSections: function () {
			return this.sections;
		},

		/**
		 * Returns a jQuery object representing all redlinks on the page.
		 * @return {jQuery.Object}
		 */
		getRedLinks: function () {
			return this.$( '.new' );
		}
	} );

	/**
	 * Create a Page object from an API response.
	 *
	 * @static
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
			// The label is either the display title or the label pageprop (the latter used by Wikidata)
			// Long term we want to consolidate these. Note that pageprops.displaytitle is HTML, while
			// terms.label[0] is plain text.
			displayTitle = terms && terms.label ? HTML.escape( terms.label[0] ) : pageprops.displaytitle;
		}
		// Add Wikidata descriptions if available (T101719)
		resp.wikidataDescription = resp.description || undefined;

		if ( thumb ) {
			resp.thumbnail.isLandscape = thumb.width > thumb.height;
		}

		// page may or may not exist.
		if ( resp.revisions && resp.revisions[0] ) {
			revision = resp.revisions[0];
			resp.lastModified = time.getLastModifiedMessage( new Date( revision.timestamp ).getTime() / 1000,
				revision.user );
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
	M.define( 'mobile.startup/Page', Page );

}( mw.html, mw.mobileFrontend ) );
